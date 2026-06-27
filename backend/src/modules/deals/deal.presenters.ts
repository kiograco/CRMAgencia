import type { Deal } from "../../database/models/index.js";

export function presentDeal(deal: Deal) {
  return {
    id: deal.id,
    companyId: deal.companyId,
    contactId: deal.contactId,
    ownerId: deal.ownerId,
    stage: deal.stage,
    title: deal.title,
    destination: deal.destination,
    value: Number(deal.value),
    probability: deal.probability,
    nextAction: deal.nextAction,
    expectedCloseAt: deal.expectedCloseAt,
    status: deal.status,
    createdAt: deal.createdAt,
    updatedAt: deal.updatedAt
  };
}
