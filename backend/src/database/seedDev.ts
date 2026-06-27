import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { Company, User } from "./models/index.js";

export async function seedDevelopmentAdmin() {
  if (env.NODE_ENV === "production") {
    return;
  }

  const [company] = await Company.findOrCreate({
    where: { document: "00000000000000" },
    defaults: {
      name: "Cruise Intelligence Demo",
      document: "00000000000000",
      status: "active"
    }
  });

  const existingUser = await User.findOne({
    where: {
      companyId: company.id,
      email: env.DEV_ADMIN_EMAIL
    }
  });

  if (existingUser) {
    return;
  }

  const passwordHash = await bcrypt.hash(env.DEV_ADMIN_PASSWORD, 12);

  await User.create({
    companyId: company.id,
    name: "Admin Demo",
    email: env.DEV_ADMIN_EMAIL,
    passwordHash,
    role: "owner",
    status: "active",
    lastLoginAt: null
  });
}
