import mongoose, { Schema } from "mongoose";

const localizedStringSchema = new Schema(
  {
    de: { type: String, default: "" },
    en: { type: String, default: "" }
  },
  { _id: false }
);

const cmsContentSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, default: "" },
    title_de: { type: String, default: "" },
    title_en: { type: String, default: "" },
    sections: { type: [Schema.Types.Mixed], default: [] },
    sections_de: { type: [Schema.Types.Mixed], default: [] },
    sections_en: { type: [Schema.Types.Mixed], default: [] },
    body: { type: localizedStringSchema, default: () => ({ de: "", en: "" }) },
    published: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const CmsContentModel = mongoose.model("CmsContent", cmsContentSchema);
