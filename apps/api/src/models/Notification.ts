import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    readStatus: { type: Boolean, default: false, index: true },
    relatedEntityId: { type: String, default: "" }
  },
  { timestamps: true }
);

export const NotificationModel = mongoose.model("Notification", notificationSchema);
