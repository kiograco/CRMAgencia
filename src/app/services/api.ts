const API_BASE_URL = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? "http://127.0.0.1:3000/api";

type ApiOptions = RequestInit & {
  body?: BodyInit | Record<string, unknown> | null;
};

async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  let body = options.body;
  if (body && typeof body === "object" && !(body instanceof FormData) && !(body instanceof Blob)) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: body as BodyInit | null | undefined,
    credentials: "include",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.message ?? "Falha na comunicacao com a API";
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export type ApiUser = {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

export type ApiContact = {
  id: string;
  companyId: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  score: number;
  interest: string | null;
  nextTrip: string | null;
  consultantId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiDeal = {
  id: string;
  companyId: string;
  contactId: string;
  ownerId: string | null;
  stage: string;
  title: string;
  destination: string | null;
  value: number;
  probability: number;
  nextAction: string | null;
  expectedCloseAt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type DashboardSummary = {
  totalContacts: number;
  hotContacts: number;
  activeDeals: number;
  wonDeals: number;
  lostDeals: number;
  pipelineValue: number;
  expectedRevenue: number;
  conversionRate: number;
};

export type UiContact = {
  id: string | number;
  name: string;
  phone: string;
  status: string;
  score: number;
  interest: string;
  nextTrip: string;
  lastInteraction: string;
  consultant: string;
};

export type UiDealCard = {
  id: string | number;
  name: string;
  dest: string;
  value: string;
  prob: number;
  action: string;
};

export const statusLabelByApi: Record<string, string> = {
  very_hot: "Muito Quente",
  hot: "Quente",
  warm: "Morno",
  cold: "Frio",
  lost: "Perdido",
  returning_customer: "Cliente Recorrente",
  waiting_response: "Aguardando Retorno",
};

export const statusApiByLabel: Record<string, string> = Object.fromEntries(
  Object.entries(statusLabelByApi).map(([api, label]) => [label, api])
);

export const stageLabelByApi: Record<string, string> = {
  new_interest: "Novo Interesse",
  in_service: "Em Atendimento",
  proposal_sent: "Orcamento Enviado",
  waiting_customer: "Aguardando Cliente",
  negotiation: "Negociacao",
  won: "Fechado",
  lost: "Perdido",
};

export const stageApiByLabel: Record<string, string> = Object.fromEntries(
  Object.entries(stageLabelByApi).map(([api, label]) => [label, api])
);

export const stageLabels = [
  "Novo Interesse",
  "Em Atendimento",
  "Orcamento Enviado",
  "Aguardando Cliente",
  "Negociacao",
  "Fechado",
  "Perdido",
];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function toUiContact(contact: ApiContact): UiContact {
  return {
    id: contact.id,
    name: contact.name,
    phone: contact.phone ?? "-",
    status: statusLabelByApi[contact.status] ?? contact.status,
    score: contact.score,
    interest: contact.interest ?? "-",
    nextTrip: contact.nextTrip ?? "-",
    lastInteraction: "API",
    consultant: contact.consultantId ? "Consultor vinculado" : "Sem consultor",
  };
}

export function toUiDealCard(deal: ApiDeal, contactsById: Map<string, ApiContact>): UiDealCard {
  const contact = contactsById.get(deal.contactId);

  return {
    id: deal.id,
    name: contact?.name ?? deal.title,
    dest: deal.destination ?? "-",
    value: formatCurrency(deal.value),
    prob: deal.probability,
    action: deal.nextAction ?? "Sem proxima acao",
  };
}

export const api = {
  login(email: string, password: string) {
    return apiRequest<{ user: ApiUser }>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
  },
  me() {
    return apiRequest<{ user: ApiUser }>("/auth/me");
  },
  logout() {
    return apiRequest<void>("/auth/logout", { method: "POST" });
  },
  dashboardSummary() {
    return apiRequest<{ summary: DashboardSummary }>("/dashboard/summary");
  },
  listContacts(status?: string) {
    const params = status ? `?status=${encodeURIComponent(status)}` : "";
    return apiRequest<{ data: ApiContact[]; pagination: { total: number } }>(`/contacts${params}`);
  },
  createContact(input: Record<string, unknown>) {
    return apiRequest<{ contact: ApiContact }>("/contacts", {
      method: "POST",
      body: input,
    });
  },
  listDeals() {
    return apiRequest<{ data: ApiDeal[]; pagination: { total: number } }>("/deals");
  },
  createDeal(input: Record<string, unknown>) {
    return apiRequest<{ deal: ApiDeal }>("/deals", {
      method: "POST",
      body: input,
    });
  },
};
