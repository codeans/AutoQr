import { EmergencyContactModel } from "../../models/EmergencyContact.js";
import { ApiError } from "../../utils/apiError.js";
import { dispatchNotification } from "../../infrastructure/notifications/notification.service.js";

export const listContacts = async (userId: string) => {
  return EmergencyContactModel.find({ userId }).sort({ priority: 1, createdAt: 1 }).lean();
};

export const createContact = async (userId: string, payload: any) => {
  const count = await EmergencyContactModel.countDocuments({ userId });
  if (count >= 10) throw new ApiError(400, "Max 10 emergency contacts per account");
  return EmergencyContactModel.create({ ...payload, userId });
};

export const updateContact = async (userId: string, id: string, payload: any) => {
  const c = await EmergencyContactModel.findOneAndUpdate({ _id: id, userId }, { $set: payload }, { new: true });
  if (!c) throw new ApiError(404, "Emergency contact not found");
  return c;
};

export const deleteContact = async (userId: string, id: string) => {
  const c = await EmergencyContactModel.findOneAndDelete({ _id: id, userId });
  if (!c) throw new ApiError(404, "Emergency contact not found");
  return { ok: true };
};

export const reorderContacts = async (userId: string, orderedIds: string[]) => {
  await Promise.all(
    orderedIds.map((id, index) =>
      EmergencyContactModel.updateOne({ _id: id, userId }, { $set: { priority: index + 1 } })
    )
  );
  return listContacts(userId);
};

export const notifyAllEmergencyContacts = async (args: {
  userId: string;
  title: string;
  message: string;
  severity?: "info" | "urgent" | "emergency";
}) => {
  const contacts = await listContacts(args.userId);
  const results = [];
  for (const c of contacts) {
    if (args.severity !== "emergency" && (c as any).notifyOnEmergencyOnly) continue;
    const r = await dispatchNotification({
      phone: (c as any).phone,
      email: (c as any).email || undefined,
      type: "emergency_alert",
      title: args.title,
      message: args.message,
      channels: ["sms", "email"]
    });
    results.push({ contact: (c as any)._id, r });
  }
  return results;
};
