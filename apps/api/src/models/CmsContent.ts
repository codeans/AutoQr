import mongoose, { Schema } from "mongoose";

const cmsContentSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    sections: { type: [Schema.Types.Mixed], default: [] },
    published: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const CmsContentModel = mongoose.model("CmsContent", cmsContentSchema);
