import type { Request, Response } from "express";
import { z } from "zod";
import { UserModel } from "../../models/User.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { logger } from "../../utils/logger.js";

const registerPushTokenSchema = z.object({
  token: z.string().min(10).max(300),
  platform: z.enum(["ios", "android", "web"]).default("android"),
  deviceId: z.string().max(200).optional(),
  appVersion: z.string().max(40).optional()
});

const unregisterPushTokenSchema = z.object({
  token: z.string().min(10).max(300)
});

export const registerPushToken = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) throw new ApiError(401, "Unauthorized");
  const body = registerPushTokenSchema.parse(req.body);

  // Pull any previous entry with the same token (possibly on this user or another), so we don't
  // leave the token registered twice and so we update lastUsedAt atomically.
  await UserModel.updateMany(
    { "pushTokens.token": body.token },
    { $pull: { pushTokens: { token: body.token } } }
  );
  await UserModel.updateOne(
    { _id: userId },
    {
      $push: {
        pushTokens: {
          token: body.token,
          platform: body.platform,
          deviceId: body.deviceId ?? "",
          appVersion: body.appVersion ?? "",
          createdAt: new Date(),
          lastUsedAt: new Date()
        }
      }
    }
  );
  logger.info("mobile.push_token.registered", { userId, platform: body.platform });
  res.json({ ok: true });
});

export const unregisterPushToken = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) throw new ApiError(401, "Unauthorized");
  const body = unregisterPushTokenSchema.parse(req.body);
  await UserModel.updateOne(
    { _id: userId },
    { $pull: { pushTokens: { token: body.token } } }
  );
  res.json({ ok: true });
});
