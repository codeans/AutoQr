import { AnalyticsEventModel } from "../../models/AnalyticsEvent.js";

export const trackEvent = async (args: {
  type: string;
  userId?: string;
  sessionId?: string;
  tagId?: string;
  entityId?: string;
  properties?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) => {
  return AnalyticsEventModel.create({
    type: args.type,
    userId: args.userId,
    sessionId: args.sessionId,
    tagId: args.tagId,
    entityId: args.entityId ?? "",
    properties: args.properties ?? {},
    ipAddress: args.ipAddress ?? "",
    userAgent: args.userAgent ?? ""
  });
};

export const getMetricsSummary = async () => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const rows = await AnalyticsEventModel.aggregate([
    { $match: { occurredAt: { $gte: since } } },
    { $group: { _id: "$type", count: { $sum: 1 } } }
  ]);
  const counts: Record<string, number> = {};
  for (const row of rows) counts[row._id] = row.count;

  const scanToOwnerReached =
    counts.owner_reached && counts.scan_landing
      ? Math.round((counts.owner_reached / counts.scan_landing) * 100)
      : 0;

  return {
    windowDays: 30,
    counts,
    ownerReachRatePercent: scanToOwnerReached
  };
};

export const listRecentEvents = async (limit = 100) => {
  return AnalyticsEventModel.find({}).sort({ occurredAt: -1 }).limit(limit).lean();
};
