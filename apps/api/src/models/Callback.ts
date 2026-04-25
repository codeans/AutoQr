import mongoose, { Schema } from "mongoose";

const callbackSchema = new Schema(
  {
    incidentId: { type: Schema.Types.ObjectId, ref: "Incident", required: true, index: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: "Car", required: false, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    callSessionId: { type: Schema.Types.ObjectId, ref: "CallSession", required: false, index: true },
    reporterPhone: { type: String, required: true },
    callbackStatus: {
      type: String,
      enum: ["pending", "calling", "connected", "declined", "missed", "completed", "failed"],
      default: "pending",
      index: true
    },
    callbackStartedAt: { type: Date },
    callbackEndedAt: { type: Date },
    duration: { type: Number, default: 0 },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

export const CallbackModel = mongoose.model("Callback", callbackSchema);
