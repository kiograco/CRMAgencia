import { app } from "./app.js";
import { env } from "./config/env.js";
import { seedDevelopmentAdmin } from "./database/seedDev.js";
import { connectDatabase } from "./database/sequelize.js";
import { syncDatabase } from "./database/sync.js";

async function bootstrap() {
  await connectDatabase();
  await syncDatabase();
  await seedDevelopmentAdmin();

  app.listen(env.PORT, () => {
    console.log(`Backend listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
