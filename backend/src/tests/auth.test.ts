import { Sequelize } from "sequelize";
import request from "supertest";
import { env } from "../config/env.js";

async function ensureTestDatabase() {
  const adminConnection = new Sequelize(
    "postgres://crm:crm@127.0.0.1:55432/postgres",
    { logging: false }
  );

  try {
    await adminConnection.query("CREATE DATABASE crm_test");
  } catch (error) {
    const code = (error as { original?: { code?: string } }).original?.code;
    if (code !== "42P04") {
      throw error;
    }
  } finally {
    await adminConnection.close();
  }
}

describe("auth routes", () => {
  let app: Awaited<typeof import("../app.js")>["app"];
  let sequelize: Awaited<typeof import("../database/sequelize.js")>["sequelize"];

  beforeAll(async () => {
    await ensureTestDatabase();

    const appModule = await import("../app.js");
    const databaseModule = await import("../database/sequelize.js");
    const syncModule = await import("../database/sync.js");
    const seedModule = await import("../database/seedDev.js");

    app = appModule.app;
    sequelize = databaseModule.sequelize;

    await databaseModule.connectDatabase();
    await syncModule.syncDatabase({ force: true });
    await seedModule.seedDevelopmentAdmin();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("logs in with development admin and does not expose passwordHash", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: env.DEV_ADMIN_EMAIL,
        password: env.DEV_ADMIN_PASSWORD
      });

    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"]).toBeDefined();
    expect(response.body.user.email).toBe(env.DEV_ADMIN_EMAIL);
    expect(response.body.user.companyId).toBeDefined();
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  it("rejects invalid login", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: env.DEV_ADMIN_EMAIL,
        password: "wrong-password"
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("INVALID_CREDENTIALS");
  });

  it("rejects /auth/me without a session", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("UNAUTHENTICATED");
  });

  it("returns current user with a valid session cookie", async () => {
    const agent = request.agent(app);

    await agent
      .post("/api/auth/login")
      .send({
        email: env.DEV_ADMIN_EMAIL,
        password: env.DEV_ADMIN_PASSWORD
      })
      .expect(200);

    const response = await agent.get("/api/auth/me");

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(env.DEV_ADMIN_EMAIL);
    expect(response.body.user.companyId).toBeDefined();
    expect(response.body.user.passwordHash).toBeUndefined();
  });
});
