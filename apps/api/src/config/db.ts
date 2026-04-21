import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

let isReady = false;

mongoose.connection.on("connected", () => {
  isReady = true;
  logger.info("mongodb_connected");
});

mongoose.connection.on("disconnected", () => {
  isReady = false;
  logger.warn("mongodb_disconnected");
});

mongoose.connection.on("error", (error) => {
  isReady = false;
  logger.error("mongodb_error", { message: error.message });
});

export const connectDatabase = async () => {
  let attempt = 0;
  while (attempt < env.DB_MAX_RETRIES) {
    attempt += 1;
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: env.DB_CONNECT_TIMEOUT_MS
      });
      return;
    } catch (error) {
      logger.warn("mongodb_connect_retry", { attempt, maxRetries: env.DB_MAX_RETRIES });
      if (attempt >= env.DB_MAX_RETRIES) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, env.DB_RETRY_DELAY_MS));
    }
  }
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
};

export const isDatabaseReady = () => isReady && mongoose.connection.readyState === 1;
