import "dotenv/config";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

neonConfig.webSocketConstructor = ws;
const databaseUrl = process.env.DATABASE_URL;
const adminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
const adminName = process.env.INITIAL_ADMIN_NAME?.trim();
if (!databaseUrl) throw new Error("DATABASE_URL is not configured.");
if (!adminEmail || !adminPassword || !adminName) throw new Error("INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL, and INITIAL_ADMIN_PASSWORD are required.");
if (adminPassword.length < 8) throw new Error("INITIAL_ADMIN_PASSWORD must contain at least 8 characters.");

const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: databaseUrl }) });

try {
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { password: adminPassword, name: adminName, role: "ADMIN" },
    create: { email: adminEmail, password: adminPassword, name: adminName, role: "ADMIN" },
  });
  console.log(`Seeded admin ${adminEmail}. No sample events or payment data were created.`);
} finally {
  await prisma.$disconnect();
}
