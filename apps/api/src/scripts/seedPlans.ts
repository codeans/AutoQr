/**
 * Syncs the four canonical catalog plans (slugs, copy, limits) and archives legacy plans.
 * Preserves existing priceCents / compareAtCents on each catalog row when it already exists.
 *
 * Run: npm run seed:plans -w @autoqr/api
 */
import { connectDatabase } from "../config/db.js";
import { syncCatalogPlans } from "../modules/plans/plan.service.js";

const run = async () => {
  await connectDatabase();
  await syncCatalogPlans();
  console.log("Catalog plans synced (car-basic, smart-key, premium-combo, fleet-pro).");
  process.exit(0);
};

run().catch((err) => {
  console.error("seed:plans failed:", err);
  process.exit(1);
});
