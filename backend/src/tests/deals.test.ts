import bcrypt from "bcryptjs";
import request from "supertest";
import { app } from "../app.js";
import { Company, Contact, Deal, User } from "../database/models/index.js";
import { sequelize } from "../database/sequelize.js";
import { syncDatabase } from "../database/sync.js";
import { ensureTestDatabase } from "./testDatabase.js";

async function login(email: string, password: string) {
  const agent = request.agent(app);
  await agent.post("/api/auth/login").send({ email, password }).expect(200);
  return agent;
}

describe("deal routes", () => {
  const password = "Admin123!demo";
  let companyAId: string;
  let companyBId: string;
  let companyAUserId: string;
  let companyBUserId: string;
  let companyAContactId: string;
  let companyBContactId: string;
  let companyBDealId: string;

  beforeAll(async () => {
    await ensureTestDatabase();
    await sequelize.authenticate();
  });

  beforeEach(async () => {
    await syncDatabase({ force: true });

    const passwordHash = await bcrypt.hash(password, 12);
    const companyA = await Company.create({
      name: "Tenant A",
      document: "33333333333333",
      status: "active"
    });
    const companyB = await Company.create({
      name: "Tenant B",
      document: "44444444444444",
      status: "active"
    });

    companyAId = companyA.id;
    companyBId = companyB.id;

    const companyAUser = await User.create({
      companyId: companyA.id,
      name: "Admin A",
      email: "deals-admin-a@example.test",
      passwordHash,
      role: "owner",
      status: "active",
      lastLoginAt: null
    });
    const companyBUser = await User.create({
      companyId: companyB.id,
      name: "Admin B",
      email: "deals-admin-b@example.test",
      passwordHash,
      role: "owner",
      status: "active",
      lastLoginAt: null
    });

    companyAUserId = companyAUser.id;
    companyBUserId = companyBUser.id;

    const companyAContact = await Contact.create({
      companyId: companyA.id,
      name: "Contato A",
      email: "deal-a@example.test",
      phone: "+5511999991111",
      status: "hot",
      score: 70,
      interest: "Caribe",
      nextTrip: "Jan/2027"
    });
    const companyBContact = await Contact.create({
      companyId: companyB.id,
      name: "Contato B",
      email: "deal-b@example.test",
      phone: "+5521999992222",
      status: "warm",
      score: 45,
      interest: "Alaska",
      nextTrip: "Mar/2027"
    });

    companyAContactId = companyAContact.id;
    companyBContactId = companyBContact.id;

    await Deal.create({
      companyId: companyA.id,
      contactId: companyAContact.id,
      ownerId: companyAUser.id,
      stage: "in_service",
      title: "Cruzeiro Tenant A",
      destination: "Caribe",
      value: 24000,
      probability: 70,
      nextAction: "Enviar proposta",
      expectedCloseAt: null,
      status: "open"
    });

    const companyBDeal = await Deal.create({
      companyId: companyB.id,
      contactId: companyBContact.id,
      ownerId: companyBUser.id,
      stage: "proposal_sent",
      title: "Cruzeiro Tenant B",
      destination: "Alaska",
      value: 38000,
      probability: 60,
      nextAction: "Follow-up",
      expectedCloseAt: null,
      status: "open"
    });

    companyBDealId = companyBDeal.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("creates a deal using companyId from authenticated user, ignoring payload companyId", async () => {
    const agent = await login("deals-admin-a@example.test", password);

    const response = await agent
      .post("/api/deals")
      .send({
        companyId: companyBId,
        contactId: companyAContactId,
        ownerId: companyAUserId,
        stage: "new_interest",
        title: "Nova oportunidade",
        destination: "Bahamas",
        value: 18000,
        probability: 45,
        nextAction: "Agendar call",
        expectedCloseAt: null
      });

    expect(response.status).toBe(201);
    expect(response.body.deal.companyId).toBe(companyAId);
    expect(response.body.deal.contactId).toBe(companyAContactId);
  });

  it("rejects creating a deal for a contact from another company", async () => {
    const agent = await login("deals-admin-a@example.test", password);

    const response = await agent
      .post("/api/deals")
      .send({
        contactId: companyBContactId,
        ownerId: companyAUserId,
        title: "Tentativa cross-tenant",
        value: 1000
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("INVALID_CONTACT");
  });

  it("rejects assigning an owner from another company", async () => {
    const agent = await login("deals-admin-a@example.test", password);

    const response = await agent
      .post("/api/deals")
      .send({
        contactId: companyAContactId,
        ownerId: companyBUserId,
        title: "Owner indevido",
        value: 1000
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("INVALID_OWNER");
  });

  it("lists only deals from authenticated user's company", async () => {
    const agent = await login("deals-admin-a@example.test", password);

    const response = await agent.get("/api/deals");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].companyId).toBe(companyAId);
    expect(response.body.data[0].title).toBe("Cruzeiro Tenant A");
  });

  it("does not expose a deal from another company by id", async () => {
    const agent = await login("deals-admin-a@example.test", password);

    const response = await agent.get(`/api/deals/${companyBDealId}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("DEAL_NOT_FOUND");
  });

  it("does not update a deal from another company", async () => {
    const agent = await login("deals-admin-a@example.test", password);

    const response = await agent
      .patch(`/api/deals/${companyBDealId}`)
      .send({ title: "Tentativa Indevida" });

    expect(response.status).toBe(404);

    const deal = await Deal.findByPk(companyBDealId);
    expect(deal?.title).toBe("Cruzeiro Tenant B");
  });

  it("does not move a deal from another company", async () => {
    const agent = await login("deals-admin-a@example.test", password);

    const response = await agent
      .patch(`/api/deals/${companyBDealId}/stage`)
      .send({ stage: "won" });

    expect(response.status).toBe(404);

    const deal = await Deal.findByPk(companyBDealId);
    expect(deal?.stage).toBe("proposal_sent");
  });

  it("moves a deal stage and derives won status", async () => {
    const agent = await login("deals-admin-b@example.test", password);

    const response = await agent
      .patch(`/api/deals/${companyBDealId}/stage`)
      .send({ stage: "won" });

    expect(response.status).toBe(200);
    expect(response.body.deal.stage).toBe("won");
    expect(response.body.deal.status).toBe("won");
  });

  it("does not delete a deal from another company", async () => {
    const agent = await login("deals-admin-a@example.test", password);

    const response = await agent.delete(`/api/deals/${companyBDealId}`);

    expect(response.status).toBe(404);

    const deal = await Deal.findByPk(companyBDealId);
    expect(deal).not.toBeNull();
  });

  it("requires authentication", async () => {
    const response = await request(app).get("/api/deals");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("UNAUTHENTICATED");
  });
});
