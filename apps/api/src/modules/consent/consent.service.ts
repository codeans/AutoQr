import { ConsentRecordModel } from "../../models/ConsentRecord.js";

export const CURRENT_POLICY_VERSIONS = {
  terms: "2026-04-01",
  privacy: "2026-04-01",
  marketing: "2026-04-01",
  data_sharing: "2026-04-01"
};

export const recordConsent = async (args: {
  userId?: string;
  sessionId?: string;
  type: keyof typeof CURRENT_POLICY_VERSIONS;
  accepted: boolean;
  ipAddress?: string;
  userAgent?: string;
}) => {
  return ConsentRecordModel.create({
    userId: args.userId,
    sessionId: args.sessionId ?? "",
    type: args.type,
    version: CURRENT_POLICY_VERSIONS[args.type],
    accepted: args.accepted,
    ipAddress: args.ipAddress ?? "",
    userAgent: args.userAgent ?? ""
  });
};

export const listConsentForUser = async (userId: string) => {
  return ConsentRecordModel.find({ userId }).sort({ createdAt: -1 }).lean();
};

export const listAllConsent = async () => {
  return ConsentRecordModel.find({}).sort({ createdAt: -1 }).limit(500).lean();
};
