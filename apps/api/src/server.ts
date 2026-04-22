import http from "node:http";
import { app } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { closeSocketServer, createSocketServer } from "./realtime/socket.js";
import { ensureSeedPlans } from "./modules/plans/plan.service.js";
import { logger } from "./utils/logger.js";

let shuttingDown = false;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const initializeDatabase = async () => {
  while (!shuttingDown) {
    try {
      await connectDatabase();
      if (shuttingDown) return;
      await ensureSeedPlans().catch((err) => logger.warn("seed.plans.failed", { error: err?.message }));
      return;
    } catch (error) {
      logger.error("api_database_initialization_failed", {
        error: error instanceof Error ? error.message : String(error),
        retryDelayMs: env.DB_RETRY_DELAY_MS
      });
      await delay(env.DB_RETRY_DELAY_MS);
    }
  }
};

const bootstrap = async () => {
  const server = http.createServer(app);
  createSocketServer(server);
  server.listen(env.PORT, () => {
    logger.info("api_listening", { port: env.PORT, nodeEnv: env.NODE_ENV });
  });
  void initializeDatabase();

  const shutdown = async (signal: NodeJS.Signals) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.warn("api_shutdown_start", { signal });
    const forceExitTimer = setTimeout(() => {
      logger.error("api_shutdown_force_exit");
      process.exit(1);
    }, 10000);
    try {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
      await closeSocketServer();
      await disconnectDatabase();
      clearTimeout(forceExitTimer);
      logger.info("api_shutdown_complete");
      process.exit(0);
    } catch (error) {
      clearTimeout(forceExitTimer);
      logger.error("api_shutdown_error", { error: error instanceof Error ? error.message : String(error) });
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });
};

bootstrap().catch((err) => {
  logger.error("api_bootstrap_failed", { error: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
