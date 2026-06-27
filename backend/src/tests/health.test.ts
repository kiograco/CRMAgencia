import request from "supertest";
import { app } from "../app.js";

describe("health routes", () => {
  it("returns service status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "cruise-crm-backend"
    });
  });
});
