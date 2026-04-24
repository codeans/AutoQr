import mongoose, { Schema } from "mongoose";

const tagBatchSchema = new Schema(
  {
    batchCode: { type: String, required: true, unique: true, index: true },
    label: { type: String, default: "" },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    quantity: { type: Number, required: true },
    generatedCount: { type: Number, default: 0 },
    printedCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft", "generated", "printed", "ready_to_ship", "shipped", "archived"],
      default: "draft",
      index: true
    },
    createdByAdminId: { type: Schema.Types.ObjectId, ref: "User" },
    printedAt: { type: Date },
    exportedAt: { type: Date },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

export const TagBatchModel = mongoose.model("TagBatch", tagBatchSchema);
