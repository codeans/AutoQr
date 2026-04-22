import mongoose, { Schema } from "mongoose";

const carSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    registrationNumber: { type: String, required: true, index: true },
    make: { type: String, default: "" },
    model: { type: String, default: "" },
    color: { type: String, default: "" },
    year: { type: Number },
    nickname: { type: String, default: "" },
    plateImage: { type: String, default: "" },
    activeTagId: { type: Schema.Types.ObjectId, ref: "Tag" },
    displayMessage: { type: String, default: "" },
    isPrimary: { type: Boolean, default: false },
    activationStatus: {
      type: String,
      enum: ["pending", "activated", "deactivated"],
      default: "pending"
    }
  },
  { timestamps: true }
);

carSchema.index({ userId: 1, registrationNumber: 1 }, { unique: true });

export const CarModel = mongoose.model("Car", carSchema);
