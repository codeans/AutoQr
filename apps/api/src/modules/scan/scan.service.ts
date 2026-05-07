import crypto from "node:crypto";
import { TagModel } from "../../models/Tag.js";
import { CarModel } from "../../models/Car.js";
import { UserModel } from "../../models/User.js";
import { ScanEventModel } from "../../models/ScanEvent.js";
import { IncidentModel } from "../../models/Incident.js";
import { AnalyticsEventModel } from "../../models/AnalyticsEvent.js";
import { ApiError } from "../../utils/apiError.js";
import { dispatchNotification } from "../../infrastructure/notifications/notification.service.js";
import { emitIncidentCreated } from "../../realtime/socket.js";
import { notifyAllEmergencyContacts } from "../emergency/emergency.service.js";
import { KeyModel } from "../../models/Key.js";

const severityByReason: Record<string, "info" | "urgent" | "emergency"> = {
  wrong_parking: "info",
  headlights_on: "urgent",
  flat_tyre: "urgent",
  towing: "urgent",
  door_or_window_open: "urgent",
  car_damaged: "urgent",
  accident: "emergency",
  other: "info"
};

const reasonTitle: Record<string, string> = {
  wrong_parking: "Your car is wrongly parked",
  headlights_on: "Headlights left on",
  flat_tyre: "Flat tyre reported",
  towing: "Your car is being towed",
  door_or_window_open: "Car door or window left open",
  car_damaged: "Your car looks damaged",
  accident: "Accident / emergency",
  other: "Someone scanned your car tag"
};

export const resolveLandingByToken = async (publicToken: string) => {
  const tag = await TagModel.findOne({ publicToken });
  if (!tag) throw new ApiError(404, "Tag not found");
  if (tag.status === "disabled" || tag.status === "lost") {
    return { tag: { serial: tag.serial, status: tag.status }, activated: false };
  }
  if (tag.status !== "activated") {
    return {
      tag: { serial: tag.serial, status: tag.status },
      activated: false,
      message: "QR Code Not Activated Yet"
    };
  }

  const assetType = tag.linkedAssetType ?? (tag.carId ? "car" : tag.keyId ? "keys" : null);

  if (assetType === "car") {
    if (!tag.carId) throw new ApiError(400, "Activated tag missing car link");
    const car = await CarModel.findById(tag.carId).lean();
    return {
      activated: true,
      tag: { id: tag.id, serial: tag.serial, status: tag.status },
      assetType: "car",
      car: car
        ? {
            id: (car as any)._id,
            nickname: (car as any).nickname,
            make: (car as any).make,
            model: (car as any).model,
            color: (car as any).color,
            displayMessage: (car as any).displayMessage,
            maskedRegistration: maskRegistration((car as any).registrationNumber)
          }
        : null
    };
  }

  if (assetType === "keys") {
    if (!tag.keyId) throw new ApiError(400, "Activated tag missing key link");
    const key = await KeyModel.findById(tag.keyId).lean();
    return {
      activated: true,
      tag: { id: tag.id, serial: tag.serial, status: tag.status },
      assetType: "keys",
      key: key
        ? {
            id: (key as any)._id,
            label: (key as any).label,
            keyType: (key as any).keyType,
            description: (key as any).description,
            returnInstructions: (key as any).returnInstructions,
            image: (key as any).image
          }
        : null
    };
  }

  // Activated but unknown/empty link (should not happen).
  return {
    activated: true,
    tag: { id: tag.id, serial: tag.serial, status: tag.status },
    assetType: null,
    car: null
  };
};

const maskRegistration = (plate: string) => {
  if (!plate) return "";
  if (plate.length <= 4) return plate;
  return `${plate.slice(0, 2)}••••${plate.slice(-2)}`;
};

export const submitScanAlert = async (args: {
  publicToken: string;
  reason: string;
  message?: string;
  reporterPhone?: string;
  reporterName?: string;
  location?: { latitude?: number; longitude?: number; address?: string };
  ipAddress?: string;
  userAgent?: string;
}) => {
  const tag = await TagModel.findOne({ publicToken: args.publicToken });
  if (!tag) throw new ApiError(404, "Tag not found");
  if (tag.status === "disabled") throw new ApiError(410, "Tag disabled");
  if (!tag.ownerUserId) throw new ApiError(400, "Tag is not active");

  const severity = severityByReason[args.reason] ?? "info";

  const scan = await ScanEventModel.create({
    tagId: tag.id,
    publicToken: args.publicToken,
    carId: tag.carId ?? undefined,
    ownerUserId: tag.ownerUserId,
    reason: args.reason,
    severity,
    message: args.message ?? "",
    reporterPhone: args.reporterPhone ?? "",
    reporterName: args.reporterName ?? "",
    ipAddress: args.ipAddress ?? "",
    userAgent: args.userAgent ?? "",
    location: args.location ?? {},
    status: "landed"
  });

  tag.lastScanAt = new Date();
  tag.scanCount = (tag.scanCount ?? 0) + 1;
  await tag.save();

  await AnalyticsEventModel.create({
    type: "scan_alert_sent",
    tagId: tag.id,
    userId: tag.ownerUserId,
    properties: { reason: args.reason, severity }
  });

  const channels =
    severity === "emergency" ? ["in_app", "push", "sms", "email"] : ["in_app", "push", "sms"];
  const title = reasonTitle[args.reason] ?? "Your car was scanned";
  const body = args.message
    ? `${title}. Reporter note: ${args.message}`
    : `${title}. Someone reported your car. Tap to respond.`;

  await dispatchNotification({
    userId: String(tag.ownerUserId),
    type: "scan_alert",
    title,
    message: body,
    channels: channels as any,
    data: { scanId: scan.id, reason: args.reason, severity },
    relatedEntityId: scan.id
  });

  scan.status = "alert_sent";
  scan.alertChannels = channels;
  await scan.save();

  if (severity === "emergency") {
    await notifyAllEmergencyContacts({
      userId: String(tag.ownerUserId),
      title: `Emergency scan alert — ${title}`,
      message: body,
      severity: "emergency"
    });
  }

  return { scanId: scan.id, severity, ownerMaskedDisplay: "The car owner has been alerted" };
};

export const requestMaskedCall = async (args: {
  publicToken: string;
  reporterPhone: string;
  reporterName?: string;
  reason?: string;
}) => {
  const tag = await TagModel.findOne({ publicToken: args.publicToken });
  if (!tag) throw new ApiError(404, "Tag not found");
  if (!tag.ownerUserId) throw new ApiError(400, "Tag not active");
  const owner = await UserModel.findById(tag.ownerUserId);
  if (!owner) throw new ApiError(404, "Owner not found");

  const reporterSessionToken = crypto.randomBytes(24).toString("hex");
  const incident = await IncidentModel.create({
    tagId: tag.id,
    carId: tag.carId ?? undefined,
    keyId: tag.keyId ?? undefined,
    userId: tag.ownerUserId,
    reporterName: args.reporterName ?? "",
    reporterPhone: args.reporterPhone,
    reporterPhoneRaw: args.reporterPhone,
    reporterSessionToken,
    message: args.reason
      ? `Private call requested via scan tag (${args.reason}).`
      : "Private call requested via scan tag.",
    callPlatform: "web",
    consentAt: new Date()
  });

  await emitIncidentCreated(String(tag.ownerUserId), {
    incidentId: incident.id,
    title: "Incoming private call",
    message: "Someone who scanned your car tag is trying to reach you."
  });

  await dispatchNotification({
    userId: String(tag.ownerUserId),
    type: "call_requested",
    title: "Incoming call request",
    message: "Someone who scanned your car tag is trying to reach you. The number is masked for privacy.",
    channels: ["in_app", "push", "sms"]
  }).catch(() => undefined);

  return {
    incidentId: incident.id,
    ownerUserId: String(tag.ownerUserId),
    reporterSessionToken,
    reporterPhone: args.reporterPhone,
    message: "Connecting you via a privacy relay — your number and the car owner's number are never shared."
  };
};
