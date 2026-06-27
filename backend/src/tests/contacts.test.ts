import bcrypt from "bcryptjs";
import request from "supertest";
import { app } from "../app.js";
import { Company, Contact, User } from "../database/models/index.js";
import { sequelize } from "../database/sequelize.js";
import { syncDatabase } from "../database/sync.js";
import { ensureTestDatabase } from "./testDatabase.js";

async function login(email: string, password: string) {
  const agent = request.agent(app);
  await agent.post("/api/auth/login").send({ email, password }).expect(200);
  return agent;
}

describe("contact routes", () => {
  const password = "Admin123!demo";
  let companyAId: string;
  let companyBId: string;
  let companyAUserId: string;
  let companyBContactId: string;

  beforeAll(async () => {
    await ensureTestDatabase();
    await sequelize.authenticate();
  });

  beforeEach(async () => {
    await syncDatabase({ force: true });

    const passwordHash = await bcrypt.hash(password, 12);
    const companyA = await Company.create({
      name: "Tenant A",
      document: "11111111111111",
      status: "active"
    });
    const companyB = await Company.create({
      name: "Tenant B",
      document: "22222222222222",
      status: "active"
    });

    companyAId = companyA.id;
    companyBId = companyB.id;

    const companyAUser = await User.create({
      companyId: companyA.id,
      name: "Admin A",
      email: "admin-a@example.test",
      passwordHash,
      role: "owner",
      status: "active",
      lastLoginAt: null
    });
    await User.create({
      companyId: companyB.id,
      name: "Admin B",
      email: "admin-b@example.test",
      passwordHash,
      role: "owner",
      status: "active",
      lastLoginAt: null
    });

    companyAUserId = companyAUser.id;

    await Contact.create({
      companyId: companyA.id,
      consultantId: companyAUser.id,
      name: "Contato Empresa A",
      email: "a@example.test",
      phone: "+5511999990000",
      status: "hot",
      score: 80,
      interest: "Caribe",
      nextTrip: "Jan/2027"
    });

    const companyBContact = await Contact.create({
      companyId: companyB.id,
      name: "Contato Empresa B",
      email: "b@example.test",
      phone: "+5521999990000",
      status: "warm",
      score: 40,
      interest: "Mediterraneo",
      nextTrip: "Mar/2027"
    });

    companyBContactId = companyBContact.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("creates a contact using companyId from authenticated user, ignoring payload companyId", async () => {
    const agent = await login("admin-a@example.test", password);

    const response = await agent
      .post("/api/contacts")
      .send({
        companyId: companyBId,
        consultantId: companyAUserId,
        name: "Novo Contato",
        email: "novo@example.test",
        phone: "+5511888887777",
        status: "very_hot",
        score: 95,
        interest: "Bahamas",
        nextTrip: "Dez/2026"
      });

    expect(response.status).toBe(201);
    expect(response.body.contact.companyId).toBe(companyAId);
  });

  it("lists only contacts from authenticated user's company", async () => {
    const agent = await login("admin-a@example.test", password);

    const response = await agent.get("/api/contacts");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].companyId).toBe(companyAId);
    expect(response.body.data[0].name).toBe("Contato Empresa A");
  });

  it("does not expose a contact from another company by id", async () => {
    const agent = await login("admin-a@example.test", password);

    const response = await agent.get(`/api/contacts/${companyBContactId}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("CONTACT_NOT_FOUND");
  });

  it("does not update a contact from another company", async () => {
    const agent = await login("admin-a@example.test", password);

    const response = await agent
      .patch(`/api/contacts/${companyBContactId}`)
      .send({ name: "Tentativa Indevida" });

    expect(response.status).toBe(404);

    const contact = await Contact.findByPk(companyBContactId);
    expect(contact?.name).toBe("Contato Empresa B");
  });

  it("does not delete a contact from another company", async () => {
    const agent = await login("admin-a@example.test", password);

    const response = await agent.delete(`/api/contacts/${companyBContactId}`);

    expect(response.status).toBe(404);

    const contact = await Contact.findByPk(companyBContactId);
    expect(contact).not.toBeNull();
  });

  it("requires authentication", async () => {
    const response = await request(app).get("/api/contacts");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("UNAUTHENTICATED");
  });
});
