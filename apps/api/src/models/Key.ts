import mongoose, { Schema } from "mongoose";

const keySchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    qrId: { type: Schema.Types.ObjectId, ref: "Tag", required: true, index: true },
    label: { type: String, required: true, index: true },
    keyType: { type: String, required: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    returnInstructions: { type: String, default: "" }
  },
  { timestamps: true }
);

// One QR can only be linked to one keys record.
keySchema.index({ qrId: 1 }, { unique: true });

export const KeyModel = mongoose.model("Key", keySchema);

