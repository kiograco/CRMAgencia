import request from "supertest";
import { app } from "../app.js";

describe("cors", () => {
  it("allows local Vite ports in development", async () => {
    const response = await request(app)
      .options("/api/auth/login")
      .set("Origin", "http://127.0.0.1:5174")
      .set("Access-Control-Request-Method", "POST");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe("http://127.0.0.1:5174");
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });
});
