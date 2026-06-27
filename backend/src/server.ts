import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./database/sequelize.js";

async function bootstrap() {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`Backend listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
