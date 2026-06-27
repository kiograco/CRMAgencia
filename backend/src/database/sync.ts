import { env } from "../config/env.js";
import { sequelize } from "./sequelize.js";
import "./models/index.js";

type SyncOptions = {
  force?: boolean;
};

export async function syncDatabase(options: SyncOptions = {}) {
  if (env.NODE_ENV === "production") {
    return;
  }

  await sequelize.sync({
    alter: !options.force,
    force: options.force ?? false
  });
}
