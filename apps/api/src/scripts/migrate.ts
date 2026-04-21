import { connectDatabase } from "../config/db.js";
import { UserModel } from "../models/User.js";
import { VehicleOrItemModel } from "../models/VehicleOrItem.js";
import { OrderModel } from "../models/Order.js";
import { PaymentModel } from "../models/Payment.js";
import { QRCodeModel } from "../models/QRCode.js";
import { IncidentModel } from "../models/Incident.js";
import { CallSessionModel } from "../models/CallSession.js";
import { NotificationModel } from "../models/Notification.js";
import { AdminAuditLogModel } from "../models/AdminAuditLog.js";
import { hashPassword } from "../utils/crypto.js";

const syncAllIndexes = async () => {
  const models = [
    UserModel,
    VehicleOrItemModel,
    OrderModel,
    PaymentModel,
    QRCodeModel,
    IncidentModel,
    CallSessionModel,
    NotificationModel,
    AdminAuditLogModel
  ];

  for (const model of models) {
    await model.syncIndexes();
    console.log(`Synced indexes: ${model.modelName}`);
  }
};

const seedAdminIfRequested = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME ?? "AutoQr Admin";
  const adminPhone = process.env.ADMIN_PHONE ?? "+491111111111";
  const adminAddress = process.env.ADMIN_ADDRESS ?? "Berlin, Germany";

  if (!adminEmail || !adminPassword) {
    console.log("Skipping admin seed (ADMIN_EMAIL / ADMIN_PASSWORD not provided).");
    return;
  }

  const existing = await UserModel.findOne({ email: adminEmail.toLowerCase() });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
      console.log(`Upgraded existing user to admin: ${adminEmail}`);
    } else {
      console.log(`Admin already exists: ${adminEmail}`);
    }
    return;
  }

  await UserModel.create({
    name: adminName,
    email: adminEmail.toLowerCase(),
    passwordHash: await hashPassword(adminPassword),
    phone: adminPhone,
    address: adminAddress,
    role: "admin",
    status: "active"
  });

  console.log(`Created admin user: ${adminEmail}`);
};

const run = async () => {
  await connectDatabase();
  await syncAllIndexes();
  await seedAdminIfRequested();
  console.log("Database migration complete.");
  process.exit(0);
};

run().catch((error) => {
  console.error("Database migration failed:", error);
  process.exit(1);
});
