import mongoose, { Schema } from "mongoose";

const appSettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true }
  },
  { timestamps: true }
);

export const AppSettingModel = mongoose.model("AppSetting", appSettingSchema);
