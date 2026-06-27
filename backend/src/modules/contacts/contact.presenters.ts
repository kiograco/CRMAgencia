import type { Contact } from "../../database/models/index.js";

export function presentContact(contact: Contact) {
  return {
    id: contact.id,
    companyId: contact.companyId,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    status: contact.status,
    score: contact.score,
    interest: contact.interest,
    nextTrip: contact.nextTrip,
    consultantId: contact.consultantId,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt
  };
}
