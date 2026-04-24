import mongoose, { Schema } from "mongoose";

export const NOTIFICATION_TYPES = [
  "INCIDENT_CREATED",
  "INCOMING_CALL",
  "MISSED_CALL",
  "CALL_ENDED",
  "QR_ACTIVATED",
  "QR_DISPATCHED",
  "ACCOUNT_UPDATED",
  // Legacy types kept for backward compatibility with existing data
  "incident_created",
  "call_missed",
  "call_ended"
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true, index: true },
    title: { type: String, required: true },
    // `message` is the legacy field name; `body` is the new one. We mirror both for compat.
    message: { type: String, default: "" },
    body: { type: String, default: "" },
    data: { type: Schema.Types.Mixed, default: {} },
    readStatus: { type: Boolean, default: false, index: true },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    relatedEntityId: { type: String, default: "", index: true }
  },
  { timestamps: true }
);

notificationSchema.pre("save", function syncFields(next) {
  // Ensure both the legacy and new field names stay in sync
  const doc = this as unknown as { message?: string; body?: string; readStatus?: boolean; isRead?: boolean };
  if (doc.body && !doc.message) doc.message = doc.body;
  if (doc.message && !doc.body) doc.body = doc.message;
  if (typeof doc.isRead === "boolean") doc.readStatus = doc.isRead;
  else if (typeof doc.readStatus === "boolean") doc.isRead = doc.readStatus;
  next();
});

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

export const NotificationModel = mongoose.model("Notification", notificationSchema);
