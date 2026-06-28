import { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard, Users, Briefcase, MessageSquare, Brain,
  Search, BarChart2, Settings, LogOut, Bell, Phone, Mail,
  AlertCircle, CheckCircle, Clock, Filter, Plus, ArrowRight,
  Calendar, DollarSign, Ship, MapPin, Zap, Activity,
  TrendingUp, MoreHorizontal, UserCheck, ChevronRight,
  FileText, AlertTriangle, Lock, Wifi, Shield, Sliders,
  BellRing, Cpu, Award, X,
} from "lucide-react";
import {
  api,
  formatCurrency,
  stageApiByLabel,
  stageLabels,
  stageLabelByApi,
  statusApiByLabel,
  toUiContact,
  toUiDealCard,
  type ApiContact,
  type ApiDeal,
  type UiContact,
  type UiDealCard,
} from "./services/api";

type Screen =
  | "login" | "dashboard" | "crm" | "profile"
  | "timeline" | "kanban" | "insights"
  | "smart-search" | "reports" | "settings";

// ── mock data ──────────────────────────────────────────────────────────────
const contacts = [
  { id: 1, name: "Ana Paula Ferreira", phone: "+55 11 99876-5432", status: "Muito Quente", score: 94, interest: "Caribe · Royal Caribbean", nextTrip: "Jan/2025", lastInteraction: "Hoje, 09:15", consultant: "Carlos Silva" },
  { id: 2, name: "Roberto Campos", phone: "+55 21 98765-4321", status: "Quente", score: 78, interest: "Mediterrâneo · MSC", nextTrip: "Mar/2025", lastInteraction: "Ontem, 14:30", consultant: "Mariana Costa" },
  { id: 3, name: "Fernanda Lima", phone: "+55 31 97654-3210", status: "Morno", score: 52, interest: "Bahamas · Norwegian", nextTrip: "Jun/2025", lastInteraction: "3 dias atrás", consultant: "Carlos Silva" },
  { id: 4, name: "Marcelo Santos", phone: "+55 41 96543-2109", status: "Frio", score: 28, interest: "Alaska · Princess", nextTrip: "Ago/2025", lastInteraction: "2 semanas", consultant: "Pedro Alves" },
  { id: 5, name: "Juliana Melo", phone: "+55 51 95432-1098", status: "Cliente Recorrente", score: 87, interest: "Ásia · Celebrity", nextTrip: "Dez/2024", lastInteraction: "Hoje, 11:00", consultant: "Mariana Costa" },
  { id: 6, name: "Ricardo Oliveira", phone: "+55 61 94321-0987", status: "Aguardando Retorno", score: 61, interest: "Caribe · Carnival", nextTrip: "Fev/2025", lastInteraction: "5 dias atrás", consultant: "Carlos Silva" },
  { id: 7, name: "Patricia Gomes", phone: "+55 71 93210-9876", status: "Perdido", score: 12, interest: "Mediterrâneo · Costa", nextTrip: "—", lastInteraction: "1 mês", consultant: "Pedro Alves" },
  { id: 8, name: "Eduardo Carvalho", phone: "+55 81 92109-8765", status: "Quente", score: 71, interest: "Caribe · Disney Cruise", nextTrip: "Jan/2025", lastInteraction: "Hoje, 07:45", consultant: "Mariana Costa" },
];

const kanbanData: Record<string, { id: number; name: string; dest: string; value: string; prob: number; action: string }[]> = {
  "Novo Interesse": [
    { id: 1, name: "Luisa Martins", dest: "Caribe", value: "R$ 18.000", prob: 45, action: "Enviar portfólio de roteiros" },
    { id: 2, name: "Thiago Barros", dest: "Mediterrâneo", value: "R$ 32.000", prob: 38, action: "Agendar call de descoberta" },
  ],
  "Em Atendimento": [
    { id: 3, name: "Ana Paula Ferreira", dest: "Caribe", value: "R$ 24.000", prob: 72, action: "Enviar orçamento personalizado" },
    { id: 4, name: "Eduardo Carvalho", dest: "Disney Cruise", value: "R$ 45.000", prob: 68, action: "Follow-up hoje até 14h" },
  ],
  "Orçamento Enviado": [
    { id: 5, name: "Roberto Campos", dest: "Mediterrâneo", value: "R$ 28.500", prob: 65, action: "Aguardar — ligar amanhã" },
    { id: 6, name: "Juliana Melo", dest: "Ásia", value: "R$ 52.000", prob: 81, action: "Negociar parcelamento 12x" },
  ],
  "Aguardando Cliente": [
    { id: 7, name: "Ricardo Oliveira", dest: "Caribe", value: "R$ 15.000", prob: 55, action: "Ligar hoje — prazo urgente" },
  ],
  "Negociação": [
    { id: 8, name: "Fernanda Lima", dest: "Bahamas", value: "R$ 19.000", prob: 70, action: "Fechar forma de pagamento" },
    { id: 9, name: "Marcos Viana", dest: "Alaska", value: "R$ 38.000", prob: 63, action: "Apresentar nova proposta" },
  ],
  "Fechado": [
    { id: 10, name: "Carla Mendes", dest: "Mediterrâneo", value: "R$ 31.000", prob: 100, action: "Emitir vouchers de embarque" },
    { id: 11, name: "Bruno Faria", dest: "Caribe", value: "R$ 22.000", prob: 100, action: "Confirmar documentação" },
  ],
  "Perdido": [
    { id: 12, name: "Patricia Gomes", dest: "Mediterrâneo", value: "R$ 25.000", prob: 0, action: "Reengajar em 3 meses" },
  ],
};

const destData = [
  { name: "Caribe", value: 42 },
  { name: "Mediterrâneo", value: 28 },
  { name: "Bahamas", value: 15 },
  { name: "Alaska", value: 8 },
  { name: "Ásia", value: 7 },
];

const conversionData = [
  { month: "Jul", leads: 45, conversoes: 12 },
  { month: "Ago", leads: 52, conversoes: 15 },
  { month: "Set", leads: 38, conversoes: 10 },
  { month: "Out", leads: 61, conversoes: 18 },
  { month: "Nov", leads: 55, conversoes: 20 },
  { month: "Dez", leads: 72, conversoes: 28 },
];

const objectionData = [
  { name: "Preço", count: 34 },
  { name: "Datas", count: 22 },
  { name: "Pagamento", count: 18 },
  { name: "Família", count: 14 },
  { name: "Concorrência", count: 9 },
];

// ── shared primitives ──────────────────────────────────────────────────────
const statusStyle: Record<string, string> = {
  "Muito Quente": "bg-red-50 text-red-700 border border-red-200",
  "Quente": "bg-orange-50 text-orange-700 border border-orange-200",
  "Morno": "bg-amber-50 text-amber-700 border border-amber-200",
  "Frio": "bg-sky-50 text-sky-600 border border-sky-200",
  "Perdido": "bg-gray-100 text-gray-500 border border-gray-200",
  "Cliente Recorrente": "bg-purple-50 text-purple-700 border border-purple-200",
  "Sem Resposta": "bg-slate-100 text-slate-600 border border-slate-200",
  "Aguardando Retorno": "bg-yellow-50 text-yellow-700 border border-yellow-200",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusStyle[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const bar = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-amber-500" : score >= 40 ? "bg-orange-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${bar} rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-700">{score}</span>
    </div>
  );
}

function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.split(" ").slice(0, 2).map(n => n[0]).join("");
  const sz = size === "lg" ? "w-14 h-14 text-xl rounded-2xl" : size === "md" ? "w-9 h-9 text-sm rounded-full" : "w-7 h-7 text-xs rounded-full";
  return (
    <div className={`${sz} bg-[#0F1629] flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "crm", label: "Contatos", icon: Users },
  { id: "kanban", label: "Oportunidades", icon: Briefcase },
  { id: "timeline", label: "Conversas", icon: MessageSquare },
  { id: "insights", label: "Insights IA", icon: Brain },
  { id: "smart-search", label: "Busca Inteligente", icon: Search },
  { id: "reports", label: "Relatórios", icon: BarChart2 },
] as const;

function Sidebar({ screen, onNavigate }: { screen: Screen; onNavigate: (s: Screen) => void }) {
  return (
    <div className="w-[220px] bg-[#0F1629] flex flex-col h-full flex-shrink-0">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center flex-shrink-0">
            <Ship className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">Cruise</div>
            <div className="text-[#2563EB] text-[10px] font-semibold tracking-widest uppercase">Intelligence CRM</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id as Screen)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              screen === id
                ? "bg-[#2563EB] text-white"
                : "text-white/55 hover:text-white hover:bg-white/8"
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium text-[13px]">{label}</span>
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
        <button
          onClick={() => onNavigate("settings")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
            screen === "settings" ? "bg-[#2563EB] text-white" : "text-white/55 hover:text-white hover:bg-white/8"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span className="font-medium text-[13px]">Configurações</span>
        </button>
        <button
          onClick={() => onNavigate("login")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-white/55 hover:text-white hover:bg-white/8 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
}

function TopBar({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-[15px] font-semibold text-gray-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-[11px] text-gray-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
          <div className="w-7 h-7 bg-[#2563EB] rounded-full flex items-center justify-center text-white text-[11px] font-bold">CS</div>
          <div>
            <div className="text-[12px] font-semibold text-gray-900 leading-tight">Carlos Silva</div>
            <div className="text-[10px] text-gray-400">Consultor Sênior</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 1 — Login ───────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("admin@demo.local");
  const [password, setPassword] = useState("Admin123!demo");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await api.login(email, password);
      onLogin();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Nao foi possivel entrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex">
      <div className="w-[48%] bg-[#0F1629] flex flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#2563EB] rounded-xl flex items-center justify-center">
            <Ship className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-tight">Cruise Intelligence</div>
            <div className="text-[#2563EB] text-[10px] font-semibold tracking-widest uppercase">CRM Comercial</div>
          </div>
        </div>

        <div>
          <h2 className="text-[34px] font-bold text-white leading-snug mb-4">
            Inteligência Comercial<br />para Consultores<br />de Cruzeiros
          </h2>
          <p className="text-white/45 text-sm leading-relaxed mb-8 max-w-xs">
            Analise conversas do WhatsApp, identifique oportunidades e feche mais vendas com o apoio da inteligência artificial.
          </p>
          <div className="space-y-3">
            {[
              { icon: Brain, text: "Análise automática de conversas do WhatsApp" },
              { icon: Zap, text: "Priorização inteligente de leads e oportunidades" },
              { icon: TrendingUp, text: "Follow-ups estratégicos com recomendações da IA" },
              { icon: BarChart2, text: "Dashboard executivo em tempo real" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#2563EB]/20 rounded-md flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-[#2563EB]" />
                </div>
                <span className="text-white/65 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/25 text-xs">© 2024 Cruise Intelligence CRM · Todos os direitos reservados</p>
      </div>

      <div className="flex-1 bg-[#F8FAFC] flex items-center justify-center p-12">
        <div className="w-full max-w-[340px]">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-1.5">Bem-vindo de volta</h3>
            <p className="text-gray-500 text-sm">Entre com suas credenciais para acessar a plataforma</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      void submitLogin();
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                <input type="checkbox" className="rounded" defaultChecked />
                Manter conectado
              </label>
              <button className="text-[#2563EB] hover:underline font-medium">Esqueceu a senha?</button>
            </div>
            <button
              onClick={() => void submitLogin()}
              disabled={loading}
              className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] disabled:opacity-60 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
            >
              {loading ? "Entrando..." : "Entrar na plataforma"}
            </button>
            {error && (
              <p className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>
          <p className="text-center text-xs text-gray-400 mt-5">
            Problemas de acesso?{" "}
            <button className="text-[#2563EB] hover:underline">Fale com o suporte</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 2 — Dashboard ───────────────────────────────────────────────────
function DashboardScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [summary, setSummary] = useState<null | {
    totalContacts: number;
    hotContacts: number;
    activeDeals: number;
    wonDeals: number;
    lostDeals: number;
    pipelineValue: number;
    expectedRevenue: number;
    conversionRate: number;
  }>(null);
  const [summaryError, setSummaryError] = useState("");

  useEffect(() => {
    api.dashboardSummary()
      .then((response) => {
        setSummary(response.summary);
        setSummaryError("");
      })
      .catch((error) => {
        setSummaryError(error instanceof Error ? error.message : "Nao foi possivel carregar o resumo");
      });
  }, []);

  const kpis = [
    { label: "Oportunidades Ativas", value: summary ? String(summary.activeDeals) : "127", delta: "API", color: "text-[#2563EB]", bg: "bg-blue-50", icon: Briefcase },
    { label: "Leads Quentes", value: summary ? String(summary.hotContacts) : "23", delta: summary ? `${summary.totalContacts} contatos` : "+5 hoje", color: "text-green-600", bg: "bg-green-50", icon: Zap },
    { label: "Oportunidades Perdidas", value: summary ? String(summary.lostDeals) : "8", delta: "tenant", color: "text-red-500", bg: "bg-red-50", icon: AlertCircle },
    { label: "Conversao", value: summary ? `${summary.conversionRate.toFixed(1)}%` : "24,4%", delta: `${summary?.wonDeals ?? 31} ganhos`, color: "text-purple-600", bg: "bg-purple-50", icon: Award },
    { label: "Receita Esperada", value: summary ? formatCurrency(summary.expectedRevenue) : "R$ 2,4M", delta: summary ? formatCurrency(summary.pipelineValue) : "+22%", color: "text-amber-600", bg: "bg-amber-50", icon: DollarSign },
  ];

  const priorities = [
    { name: "Ana Paula Ferreira", prob: 94, dest: "Caribe · Royal Caribbean", pax: 4, lastContact: "Hoje, 09:15", daysSilent: 0, reason: "Orçamento aprovado internamente, aguarda proposta final", action: "Enviar proposta final com parcelamento em 12x no cartão" },
    { name: "Juliana Melo", prob: 87, dest: "Ásia · Celebrity Cruises", pax: 2, lastContact: "Hoje, 11:00", daysSilent: 0, reason: "Cliente recorrente — realiza viagem anual conosco", action: "Oferecer upgrade de cabine com desconto de fidelidade" },
    { name: "Eduardo Carvalho", prob: 71, dest: "Caribe · Disney Cruise", pax: 5, lastContact: "Hoje, 07:45", daysSilent: 0, reason: "Família aguarda confirmação de datas para Jan/25", action: "Confirmar disponibilidade de cabines e enviar hoje" },
    { name: "Roberto Campos", prob: 78, dest: "Mediterrâneo · MSC", pax: 2, lastContact: "Ontem, 14:30", daysSilent: 1, reason: "Orçamento enviado — sem retorno após 24h", action: "Ligar às 14h e oferecer condições especiais" },
    { name: "Ricardo Oliveira", prob: 61, dest: "Caribe · Carnival", pax: 3, lastContact: "5 dias atrás", daysSilent: 5, reason: "Pediu 5 dias para decidir — prazo expira hoje", action: "WhatsApp urgente — promoção encerra à meia-noite" },
  ];

  const alerts = [
    { icon: AlertTriangle, color: "text-amber-500 bg-amber-50 border-amber-100", text: "12 leads quentes sem contato há mais de 7 dias" },
    { icon: Clock, color: "text-blue-500 bg-blue-50 border-blue-100", text: "5 clientes aguardando retorno de orçamento" },
    { icon: Calendar, color: "text-purple-500 bg-purple-50 border-purple-100", text: "3 oportunidades com embarque em Janeiro/2025" },
    { icon: UserCheck, color: "text-green-500 bg-green-50 border-green-100", text: "4 clientes recorrentes sem contato recente" },
    { icon: AlertCircle, color: "text-red-500 bg-red-50 border-red-100", text: "2 oportunidades com prazo expirando hoje" },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-5 max-w-[1440px]">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Bom dia, Carlos! 👋</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Segunda-feira, 23 de dezembro de 2024 · Você tem{" "}
            <span className="text-[#2563EB] font-semibold">5 prioridades</span> para hoje
          </p>
        </div>
        {summaryError && (
          <div className="text-[12px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            {summaryError}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-5 gap-4">
          {kpis.map(({ label, value, delta, color, bg, icon: Icon }) => (
            <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <span className={`text-[11px] font-semibold ${color}`}>{delta}</span>
              </div>
              <div className={`text-2xl font-bold ${color} mb-0.5`}>{value}</div>
              <div className="text-[11px] text-gray-500 leading-tight">{label}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Priorities */}
          <div className="col-span-8">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div>
                  <h3 className="font-semibold text-gray-900 text-[14px]">Prioridades de Hoje</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Ordenado por potencial de fechamento</p>
                </div>
                <button className="text-[12px] text-[#2563EB] font-medium hover:underline flex items-center gap-1">
                  Ver todos <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {priorities.map((p, i) => (
                  <div
                    key={i}
                    className="p-4 hover:bg-gray-50/60 transition-colors cursor-pointer"
                    onClick={() => onNavigate("profile")}
                  >
                    <div className="flex items-start justify-between mb-2.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.name} />
                        <div>
                          <div className="text-[13px] font-semibold text-gray-900">{p.name}</div>
                          <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {p.dest} · {p.pax} pax
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        {p.daysSilent > 3 && (
                          <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded-full font-medium">
                            {p.daysSilent}d sem contato
                          </span>
                        )}
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{p.prob}%</div>
                          <div className="text-[10px] text-gray-400">conversão</div>
                        </div>
                      </div>
                    </div>
                    <div className="pl-10 space-y-1.5">
                      <p className="text-[11px] text-gray-500">
                        <span className="font-semibold text-[#2563EB]">Motivo: </span>{p.reason}
                      </p>
                      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-2.5 py-1.5 rounded-lg">
                        <Zap className="w-3 h-3 text-amber-500 flex-shrink-0" />
                        <span className="text-[11px] text-amber-800 font-medium">{p.action}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3.5 border-b border-gray-50">
                <h3 className="font-semibold text-gray-900 text-[14px] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#2563EB]" />
                  Alertas Inteligentes
                </h3>
              </div>
              <div className="p-3 space-y-1.5">
                {alerts.map((a, i) => (
                  <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${a.color} cursor-pointer hover:opacity-80 transition-opacity`}>
                    <a.icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span className="text-[11px] text-gray-700 leading-relaxed">{a.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0F1629] rounded-xl p-5">
              <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">Taxa de Conversão · Dez/24</div>
              <div className="text-[34px] font-bold text-white leading-none mb-1">24,4%</div>
              <div className="text-[11px] text-white/40 mb-4">vs. 18,2% no mês anterior</div>
              <div className="flex items-center gap-1.5 mb-3">
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                <span className="text-[12px] text-green-400 font-semibold">+6,2 pontos percentuais</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#2563EB] rounded-full" style={{ width: "24.4%" }} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h4 className="text-[12px] font-semibold text-gray-700 mb-3">Resumo do Funil</h4>
              <div className="space-y-2">
                {[
                  { label: "Novos leads hoje", value: "7", color: "bg-blue-500" },
                  { label: "Follow-ups pendentes", value: "14", color: "bg-amber-500" },
                  { label: "Fechamentos previstos", value: "3", color: "bg-green-500" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 ${color} rounded-full`} />
                      <span className="text-[11px] text-gray-600">{label}</span>
                    </div>
                    <span className="text-[12px] font-bold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 3 — CRM ─────────────────────────────────────────────────────────
function CRMScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [active, setActive] = useState("Todos");
  const [apiContacts, setApiContacts] = useState<UiContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Quente",
    score: "70",
    interest: "",
    nextTrip: "",
  });
  const filters = ["Todos", "Muito Quente", "Quente", "Morno", "Frio", "Perdido", "Cliente Recorrente", "Aguardando Retorno"];
  const sourceContacts = apiContacts.length > 0 ? apiContacts : contacts;
  const rows = active === "Todos" ? sourceContacts : sourceContacts.filter(c => c.status === active);

  const loadContacts = async () => {
    setLoading(true);
    setApiError("");

    try {
      const response = await api.listContacts();
      setApiContacts(response.data.map(toUiContact));
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Nao foi possivel carregar contatos da API");
    } finally {
      setLoading(false);
    }
  };

  const createContactFromForm = async () => {
    setLoading(true);
    setApiError("");

    try {
      const response = await api.createContact({
        name: contactForm.name,
        email: contactForm.email || null,
        phone: contactForm.phone || null,
        status: statusApiByLabel[contactForm.status] ?? "warm",
        score: Number(contactForm.score),
        interest: contactForm.interest || null,
        nextTrip: contactForm.nextTrip || null,
      });

      setApiContacts((current) => [toUiContact(response.contact), ...current]);
      setContactForm({ name: "", email: "", phone: "", status: "Quente", score: "70", interest: "", nextTrip: "" });
      setShowContactForm(false);
      setActive("Todos");
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Nao foi possivel criar contato");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadContacts();
  }, []);

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, destino, telefone..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50">
            <Filter className="w-4 h-4" /> Filtros avançados
          </button>
          <button
            onClick={() => setShowContactForm((value) => !value)}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-[#2563EB] rounded-lg text-[13px] text-white hover:bg-[#1d4ed8] disabled:opacity-60"
          >
            <Plus className="w-4 h-4" /> Novo Contato
          </button>
        </div>
        {apiError && (
          <div className="text-[12px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            {apiError}
          </div>
        )}
        {showContactForm && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="grid grid-cols-4 gap-3">
              <input value={contactForm.name} onChange={(event) => setContactForm({ ...contactForm, name: event.target.value })} placeholder="Nome" className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#2563EB]" />
              <input value={contactForm.email} onChange={(event) => setContactForm({ ...contactForm, email: event.target.value })} placeholder="E-mail" className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#2563EB]" />
              <input value={contactForm.phone} onChange={(event) => setContactForm({ ...contactForm, phone: event.target.value })} placeholder="Telefone" className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#2563EB]" />
              <select value={contactForm.status} onChange={(event) => setContactForm({ ...contactForm, status: event.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] bg-white focus:outline-none focus:border-[#2563EB]">
                {filters.filter((filter) => filter !== "Todos").map((filter) => <option key={filter}>{filter}</option>)}
              </select>
              <input value={contactForm.score} onChange={(event) => setContactForm({ ...contactForm, score: event.target.value })} type="number" min="0" max="100" placeholder="Score" className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#2563EB]" />
              <input value={contactForm.interest} onChange={(event) => setContactForm({ ...contactForm, interest: event.target.value })} placeholder="Interesse" className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#2563EB]" />
              <input value={contactForm.nextTrip} onChange={(event) => setContactForm({ ...contactForm, nextTrip: event.target.value })} placeholder="Proxima viagem" className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#2563EB]" />
              <div className="flex gap-2">
                <button onClick={() => void createContactFromForm()} disabled={loading || !contactForm.name.trim()} className="flex-1 px-3 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold disabled:opacity-50">Salvar</button>
                <button onClick={() => setShowContactForm(false)} className="px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-[13px]">Cancelar</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-1.5 flex-wrap">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                active === f
                  ? "bg-[#2563EB] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["Nome", "Telefone", "Status", "Score", "Interesse Principal", "Próxima Viagem", "Última Interação", "Consultor", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map(c => (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                  onClick={() => onNavigate("profile")}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={c.name} />
                      <span className="text-[13px] font-semibold text-gray-900 whitespace-nowrap">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-gray-500 whitespace-nowrap">{c.phone}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3"><ScoreBar score={c.score} /></td>
                  <td className="px-4 py-3 text-[12px] text-gray-600 whitespace-nowrap">{c.interest}</td>
                  <td className="px-4 py-3 text-[12px] text-gray-600 whitespace-nowrap">{c.nextTrip}</td>
                  <td className="px-4 py-3 text-[12px] text-gray-400 whitespace-nowrap">{c.lastInteraction}</td>
                  <td className="px-4 py-3 text-[12px] text-gray-600 whitespace-nowrap">{c.consultant}</td>
                  <td className="px-4 py-3">
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-[12px] text-gray-400">
          <span>Mostrando <strong className="text-gray-600">{rows.length}</strong> de <strong className="text-gray-600">{sourceContacts.length}</strong> contatos</span>
          <div className="flex items-center gap-1.5">
            {["Anterior", "1", "2", "3", "Próxima"].map((p, i) => (
              <button key={i} className={`px-3 py-1.5 rounded-lg border transition-colors ${p === "1" ? "bg-[#2563EB] text-white border-[#2563EB]" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 4 — Client Profile ──────────────────────────────────────────────
function ProfileScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-4 max-w-[1200px]">
        <div className="flex items-center gap-2 text-[12px] text-gray-400">
          <button onClick={() => onNavigate("crm")} className="hover:text-[#2563EB] transition-colors">Contatos</button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 font-medium">Ana Paula Ferreira</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar name="Ana Paula Ferreira" size="lg" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Ana Paula Ferreira</h2>
                <div className="flex flex-wrap items-center gap-4 text-[12px] text-gray-500 mb-2">
                  <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> +55 11 99876-5432</span>
                  <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-green-500" /> WhatsApp ativo</span>
                  <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> anapaula@email.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status="Muito Quente" />
                  <span className="text-[11px] text-gray-400">Cliente desde Mar/2023 · Consultor: Carlos Silva</span>
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-3xl font-bold text-green-600 leading-none">94%</div>
              <div className="text-[11px] text-gray-400 mt-1 mb-2">probabilidade de conversão</div>
              <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden ml-auto">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "94%" }} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 space-y-4">
            {/* Summary cards row 1 */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Destino", value: "Caribe", sub: "Royal Caribbean", icon: MapPin, color: "text-[#2563EB]" },
                { label: "Investimento", value: "R$ 24.000", sub: "4 passageiros", icon: DollarSign, color: "text-green-600" },
                { label: "Data Pretendida", value: "Jan/2025", sub: "Dez preferível", icon: Calendar, color: "text-purple-600" },
              ].map(({ label, value, sub, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
                  </div>
                  <div className="text-[15px] font-bold text-gray-900">{value}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>
                </div>
              ))}
            </div>

            {/* Summary cards row 2 */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Companhia", value: "Royal Caribbean", sub: "Harmony of the Seas", icon: Ship, color: "text-[#2563EB]" },
                { label: "Passageiros", value: "4 pessoas", sub: "2 adultos, 2 crianças", icon: Users, color: "text-orange-500" },
                { label: "Histórico", value: "2 compras", sub: "R$ 41.000 no total", icon: Activity, color: "text-teal-600" },
              ].map(({ label, value, sub, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
                  </div>
                  <div className="text-[15px] font-bold text-gray-900">{value}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>
                </div>
              ))}
            </div>

            {/* AI Summary */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-[#2563EB]" />
                <h3 className="font-semibold text-gray-900 text-[14px]">Resumo Gerado por IA</h3>
                <span className="ml-auto text-[10px] bg-blue-50 text-[#2563EB] border border-blue-100 px-2 py-0.5 rounded-full font-medium">Atualizado hoje</span>
              </div>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                Ana Paula está altamente engajada e demonstrou intenção clara de compra. Ela pesquisou o roteiro Caribe com a Royal Caribbean para janeiro de 2025, com foco no navio Harmony of the Seas. A família é composta por ela, o marido e dois filhos (8 e 12 anos). O orçamento de <strong className="text-gray-800">R$ 24.000</strong> foi considerado razoável. A principal motivação é celebrar o <strong className="text-gray-800">aniversário de casamento de 15 anos</strong>. Enviou fotos do navio para o marido e relatou aprovação familiar. Score de urgência: <strong className="text-red-600">muito alto</strong>.
              </p>
            </div>

            {/* Objections */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-semibold text-gray-900 text-[14px]">Objeções Detectadas</h3>
              </div>
              <div className="space-y-2">
                {[
                  { obj: "Forma de Pagamento", detail: "Deseja parcelar em 12x no cartão de crédito", severity: "média", resolved: false },
                  { obj: "Datas", detail: "Prefere dezembro — aceitou janeiro como alternativa", severity: "baixa", resolved: true },
                  { obj: "Aprovação Familiar", detail: "Marido aprovado, filhos entusiasmados com Disney", severity: "baixa", resolved: true },
                ].map(({ obj, detail, severity, resolved }) => (
                  <div
                    key={obj}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${resolved ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100"}`}
                  >
                    {resolved
                      ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      : <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    }
                    <div className="flex-1">
                      <div className="text-[12px] font-semibold text-gray-800">
                        {obj} <span className="font-normal text-gray-400">· severidade {severity}</span>
                      </div>
                      <div className="text-[11px] text-gray-600 mt-0.5">{detail}</div>
                    </div>
                    {resolved && <span className="text-[10px] text-green-600 font-semibold flex-shrink-0">Resolvida</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-4 space-y-4">
            <div className="bg-[#0F1629] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-[#2563EB]" />
                <h3 className="font-semibold text-white text-[14px]">Próxima Ação Recomendada</h3>
              </div>
              <p className="text-[12px] text-white/70 leading-relaxed mb-4">
                Enviar proposta final com opção de parcelamento em <strong className="text-white">12x no cartão</strong>. Mencionar disponibilidade limitada para Jan/25. Oferecer cortesia de upgrade de cabine como bonificação.
              </p>
              <button className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white py-2 rounded-lg text-[13px] font-semibold transition-colors">
                Executar agora
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 text-[13px] mb-3">Ações Rápidas</h3>
              <div className="space-y-1.5">
                {[
                  { label: "Abrir no WhatsApp", icon: MessageSquare, screen: null },
                  { label: "Ver timeline completa", icon: Activity, screen: "timeline" },
                  { label: "Enviar orçamento", icon: FileText, screen: null },
                  { label: "Agendar follow-up", icon: Calendar, screen: null },
                ].map(({ label, icon: Icon, screen }) => (
                  <button
                    key={label}
                    onClick={() => screen && onNavigate(screen as Screen)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-gray-700 hover:bg-gray-50 border border-gray-100 transition-colors text-left"
                  >
                    <Icon className="w-3.5 h-3.5 text-gray-400" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-[13px]">Histórico Recente</h3>
                <button onClick={() => onNavigate("timeline")} className="text-[11px] text-[#2563EB] hover:underline">Ver tudo</button>
              </div>
              <div className="space-y-2.5">
                {[
                  { event: "Orçamento enviado", date: "20/12", color: "bg-blue-400" },
                  { event: "Follow-up WhatsApp", date: "18/12", color: "bg-green-400" },
                  { event: "Solicitação de orçamento", date: "15/12", color: "bg-purple-400" },
                  { event: "Retorno espontâneo", date: "12/12", color: "bg-[#2563EB]" },
                ].map(({ event, date, color }) => (
                  <div key={event} className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 ${color} rounded-full flex-shrink-0`} />
                    <span className="text-[11px] text-gray-600 flex-1">{event}</span>
                    <span className="text-[10px] text-gray-400">{date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 5 — Timeline ────────────────────────────────────────────────────
function TimelineScreen() {
  const events = [
    { date: "23 Dez, 2024", time: "09:15", type: "followup", title: "Follow-up realizado", desc: "Mensagem de acompanhamento enviada. Confirmação de leitura em 4 minutos.", status: "ok" },
    { date: "20 Dez, 2024", time: "14:30", type: "send", title: "Orçamento enviado", desc: "PDF com 3 opções de cabine Royal Caribbean enviado via WhatsApp. Visualizado às 15:10.", status: "ok" },
    { date: "18 Dez, 2024", time: "11:00", type: "request", title: "Solicitação de orçamento", desc: "Ana Paula solicitou orçamento para Caribe em jan/25 — 4 passageiros, cabine de luxo no Harmony of the Seas.", status: "ok" },
    { date: "18 Dez, 2024", time: "10:52", type: "objection", title: "Objeção registrada: Parcelamento", desc: "Cliente mencionou preferência por parcelamento em 12x no cartão de crédito. Nenhuma objeção de valor.", status: "alert" },
    { date: "15 Dez, 2024", time: "16:20", type: "contact", title: "Primeiro contato da temporada", desc: "Ana Paula retornou após 4 meses de ausência. Expressou interesse em cruzeiro de aniversário de casamento.", status: "ok" },
    { date: "15 Dez, 2024", time: "09:00", type: "ai", title: "IA identificou oportunidade", desc: "Sistema detectou padrão de interesse recorrente com base no histórico — classificação automática: Muito Quente.", status: "ai" },
    { date: "15 Ago, 2024", time: "—", type: "purchase", title: "Última compra realizada", desc: "Cruzeiro Mediterrâneo MSC · R$ 22.000 · Embarque Set/24 · Avaliação pós-viagem: ⭐⭐⭐⭐⭐", status: "success" },
  ];

  const typeIcon: Record<string, React.ReactNode> = {
    send: <FileText className="w-3.5 h-3.5 text-white" />,
    followup: <ArrowRight className="w-3.5 h-3.5 text-white" />,
    request: <MessageSquare className="w-3.5 h-3.5 text-white" />,
    objection: <AlertTriangle className="w-3.5 h-3.5 text-white" />,
    contact: <Phone className="w-3.5 h-3.5 text-white" />,
    ai: <Brain className="w-3.5 h-3.5 text-white" />,
    purchase: <CheckCircle className="w-3.5 h-3.5 text-white" />,
  };

  const typeBg: Record<string, string> = {
    send: "bg-blue-500", followup: "bg-green-500", request: "bg-purple-500",
    objection: "bg-amber-500", contact: "bg-[#2563EB]", ai: "bg-indigo-500", purchase: "bg-emerald-500",
  };

  const statusCard: Record<string, string> = {
    ok: "bg-white border-gray-100",
    alert: "bg-amber-50 border-amber-100",
    ai: "bg-indigo-50 border-indigo-100",
    success: "bg-green-50 border-green-100",
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 max-w-2xl">
        <div className="relative">
          <div className="absolute left-[19px] top-4 bottom-0 w-px bg-gray-200" />
          <div className="space-y-4">
            {events.map((ev, i) => (
              <div key={i} className="flex gap-5">
                <div className={`w-9 h-9 ${typeBg[ev.type]} rounded-full flex items-center justify-center flex-shrink-0 shadow-sm z-10`}>
                  {typeIcon[ev.type]}
                </div>
                <div className={`flex-1 rounded-xl border shadow-sm p-4 ${statusCard[ev.status]}`}>
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h4 className="text-[13px] font-semibold text-gray-900">{ev.title}</h4>
                    <span className="text-[11px] text-gray-400 flex-shrink-0">{ev.date} · {ev.time}</span>
                  </div>
                  <p className="text-[12px] text-gray-600 leading-relaxed">{ev.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 6 — Kanban ──────────────────────────────────────────────────────
function KanbanScreen() {
  const [apiDeals, setApiDeals] = useState<ApiDeal[]>([]);
  const [apiContacts, setApiContacts] = useState<ApiContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showDealForm, setShowDealForm] = useState(false);
  const [dealForm, setDealForm] = useState({
    contactId: "",
    title: "",
    destination: "",
    value: "22000",
    probability: "55",
    stage: "Novo Interesse",
    nextAction: "",
  });
  const colAccent: Record<string, string> = {
    "Novo Interesse": "border-t-gray-300",
    "Em Atendimento": "border-t-blue-400",
    "Orçamento Enviado": "border-t-purple-400",
    "Orcamento Enviado": "border-t-purple-400",
    "Aguardando Cliente": "border-t-amber-400",
    "Negociação": "border-t-orange-400",
    "Negociacao": "border-t-orange-400",
    "Fechado": "border-t-green-500",
    "Perdido": "border-t-red-400",
  };

  const probColor = (p: number) =>
    p === 100 ? "text-green-600" : p === 0 ? "text-gray-400" : p >= 70 ? "text-green-600" : p >= 50 ? "text-amber-600" : "text-orange-500";
  const contactsById = new Map(apiContacts.map((contact) => [contact.id, contact]));
  const apiKanbanData = stageLabels.reduce<Record<string, UiDealCard[]>>((acc, label) => {
    acc[label] = [];
    return acc;
  }, {});

  for (const deal of apiDeals) {
    const label = stageLabelByApi[deal.stage] ?? deal.stage;
    apiKanbanData[label] ??= [];
    apiKanbanData[label].push(toUiDealCard(deal, contactsById));
  }

  const visibleKanbanData = apiDeals.length > 0 ? apiKanbanData : kanbanData;
  const totalDeals = Object.values(visibleKanbanData).reduce((total, cards) => total + cards.length, 0);
  const totalValue = apiDeals.reduce((total, deal) => total + Number(deal.value), 0);
  const expectedValue = apiDeals.reduce((total, deal) => total + Number(deal.value) * (deal.probability / 100), 0);

  const loadKanban = async () => {
    setLoading(true);
    setApiError("");

    try {
      const [contactsResponse, dealsResponse] = await Promise.all([
        api.listContacts(),
        api.listDeals(),
      ]);

      setApiContacts(contactsResponse.data);
      setApiDeals(dealsResponse.data);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Nao foi possivel carregar oportunidades da API");
    } finally {
      setLoading(false);
    }
  };

  const createDealFromForm = async () => {
    setLoading(true);
    setApiError("");

    try {
      const contactId = dealForm.contactId || apiContacts[0]?.id;

      if (!contactId) {
        throw new Error("Cadastre um contato antes de criar uma oportunidade");
      }

      const createdDeal = await api.createDeal({
        contactId,
        stage: stageApiByLabel[dealForm.stage] ?? "new_interest",
        title: dealForm.title,
        destination: dealForm.destination || null,
        value: Number(dealForm.value),
        probability: Number(dealForm.probability),
        nextAction: dealForm.nextAction || null,
      });

      setApiDeals((current) => [createdDeal.deal, ...current]);
      setDealForm({ contactId: "", title: "", destination: "", value: "22000", probability: "55", stage: "Novo Interesse", nextAction: "" });
      setShowDealForm(false);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Nao foi possivel criar oportunidade");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadKanban();
  }, []);

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4 text-[12px] text-gray-500">
            <span>Total: <strong className="text-gray-900">{totalDeals} oportunidades</strong></span>
            <span className="text-gray-300">·</span>
            <span>Valor: <strong className="text-green-600">{apiDeals.length > 0 ? formatCurrency(totalValue) : "R$ 384.000"}</strong></span>
            <span className="text-gray-300">·</span>
            <span>Receita esperada: <strong className="text-[#2563EB]">{apiDeals.length > 0 ? formatCurrency(expectedValue) : "R$ 216.000"}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[12px] text-gray-600 hover:bg-gray-50">
              <Filter className="w-3.5 h-3.5" /> Filtrar
            </button>
            <button
              onClick={() => setShowDealForm((value) => !value)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] rounded-lg text-[12px] text-white hover:bg-[#1d4ed8] disabled:opacity-60"
            >
              <Plus className="w-3.5 h-3.5" /> Nova Oportunidade
            </button>
          </div>
        </div>
        {apiError && (
          <div className="text-[12px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
            {apiError}
          </div>
        )}
        {showDealForm && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
            <div className="grid grid-cols-4 gap-3">
              <select value={dealForm.contactId} onChange={(event) => setDealForm({ ...dealForm, contactId: event.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] bg-white focus:outline-none focus:border-[#2563EB]">
                <option value="">Contato</option>
                {apiContacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}</option>)}
              </select>
              <input value={dealForm.title} onChange={(event) => setDealForm({ ...dealForm, title: event.target.value })} placeholder="Titulo" className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#2563EB]" />
              <input value={dealForm.destination} onChange={(event) => setDealForm({ ...dealForm, destination: event.target.value })} placeholder="Destino" className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#2563EB]" />
              <select value={dealForm.stage} onChange={(event) => setDealForm({ ...dealForm, stage: event.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] bg-white focus:outline-none focus:border-[#2563EB]">
                {stageLabels.map((stage) => <option key={stage}>{stage}</option>)}
              </select>
              <input value={dealForm.value} onChange={(event) => setDealForm({ ...dealForm, value: event.target.value })} type="number" min="0" placeholder="Valor" className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#2563EB]" />
              <input value={dealForm.probability} onChange={(event) => setDealForm({ ...dealForm, probability: event.target.value })} type="number" min="0" max="100" placeholder="Probabilidade" className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#2563EB]" />
              <input value={dealForm.nextAction} onChange={(event) => setDealForm({ ...dealForm, nextAction: event.target.value })} placeholder="Proxima acao" className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#2563EB]" />
              <div className="flex gap-2">
                <button onClick={() => void createDealFromForm()} disabled={loading || !dealForm.title.trim() || (!dealForm.contactId && apiContacts.length === 0)} className="flex-1 px-3 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold disabled:opacity-50">Salvar</button>
                <button onClick={() => setShowDealForm(false)} className="px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-[13px]">Cancelar</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 overflow-x-auto pb-4">
          {Object.entries(visibleKanbanData).map(([col, cards]) => (
            <div key={col} className="w-56 flex-shrink-0">
              <div className={`bg-white rounded-xl border border-gray-100 shadow-sm border-t-2 ${colAccent[col]} overflow-hidden`}>
                <div className="px-3 py-3 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-gray-800">{col}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">{cards.length}</span>
                  </div>
                  <button className="p-0.5 hover:bg-gray-100 rounded transition-colors">
                    <Plus className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
                <div className="p-2 space-y-2">
                  {cards.map(card => (
                    <div
                      key={card.id}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-[12px] font-semibold text-gray-900 leading-tight">{card.name}</span>
                        <span className={`text-[12px] font-bold flex-shrink-0 ml-2 ${probColor(card.prob)}`}>
                          {card.prob}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-1.5">
                        <MapPin className="w-3 h-3 text-gray-300" />
                        <span className="text-[11px] text-gray-500">{card.dest}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        <DollarSign className="w-3 h-3 text-gray-300" />
                        <span className="text-[11px] font-semibold text-gray-700">{card.value}</span>
                      </div>
                      <div className="flex items-start gap-1 bg-white rounded-md p-1.5 border border-gray-100">
                        <Zap className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span className="text-[10px] text-gray-600 leading-snug">{card.action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 7 — AI Insights ─────────────────────────────────────────────────
function InsightsScreen() {
  const PIE_COLORS = ["#2563EB", "#16A34A", "#D97706", "#DC2626", "#7C3AED"];

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        <div className="grid grid-cols-12 gap-4">
          {/* Destinations pie */}
          <div className="col-span-5 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-[14px] font-semibold text-gray-900">Destinos Mais Procurados</h3>
            <p className="text-[11px] text-gray-400 mb-4">Últimos 30 dias · 148 conversas analisadas</p>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={destData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                  {destData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, "Participação"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
              {destData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-[11px] text-gray-600">{d.name}</span>
                  <span className="text-[11px] font-bold text-gray-900 ml-auto">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion bar chart */}
          <div className="col-span-7 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-[14px] font-semibold text-gray-900">Leads vs. Conversões</h3>
            <p className="text-[11px] text-gray-400 mb-4">Jul a Dez/2024 · taxa atual: 38,9%</p>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={conversionData} barSize={12} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="leads" fill="#DBEAFE" radius={[3, 3, 0, 0]} name="Leads" />
                <Bar dataKey="conversoes" fill="#2563EB" radius={[3, 3, 0, 0]} name="Conversões" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Objections */}
          <div className="col-span-5 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-[14px] font-semibold text-gray-900">Principais Objeções</h3>
            <p className="text-[11px] text-gray-400 mb-4">Detectadas pela IA nas conversas</p>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={objectionData} layout="vertical" barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} width={82} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#D97706" radius={[0, 3, 3, 0]} name="Ocorrências" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* KPI mini cards + top clients */}
          <div className="col-span-7 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Taxa de Conversão Geral", value: "24,4%", delta: "+6,2pp", good: true },
                { label: "Tempo Médio de Fechamento", value: "18 dias", delta: "-3 dias", good: true },
                { label: "Ticket Médio", value: "R$ 27.400", delta: "+R$ 2.100", good: true },
                { label: "Leads Perdidos no Mês", value: "8 leads", delta: "+2 leads", good: false },
              ].map(({ label, value, delta, good }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="text-[11px] text-gray-400 mb-1">{label}</div>
                  <div className="text-xl font-bold text-gray-900 mb-1">{value}</div>
                  <div className={`text-[11px] font-medium flex items-center gap-1 ${good ? "text-green-600" : "text-red-500"}`}>
                    <TrendingUp className="w-3 h-3" /> {delta} vs. mês anterior
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-[13px] font-semibold text-gray-900 mb-3">Clientes com Maior Potencial</h3>
              <div className="space-y-2.5">
                {[
                  { name: "Juliana Melo", value: "R$ 52.000", prob: 87 },
                  { name: "Ana Paula Ferreira", value: "R$ 24.000", prob: 94 },
                  { name: "Eduardo Carvalho", value: "R$ 45.000", prob: 71 },
                ].map(({ name, value, prob }) => (
                  <div key={name} className="flex items-center gap-3">
                    <Avatar name={name} />
                    <span className="text-[12px] text-gray-700 flex-1">{name}</span>
                    <span className="text-[12px] font-semibold text-gray-900">{value}</span>
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${prob}%` }} />
                    </div>
                    <span className="text-[12px] font-bold text-green-600">{prob}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Loss reasons */}
          <div className="col-span-12 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-[14px] font-semibold text-gray-900 mb-4">Motivos de Perda · Últimos 90 dias</h3>
            <div className="grid grid-cols-5 gap-3">
              {[
                { reason: "Preço muito alto", count: 12, pct: 38 },
                { reason: "Sem decisão de compra", count: 8, pct: 25 },
                { reason: "Escolheu concorrente", count: 6, pct: 19 },
                { reason: "Mudança de planos", count: 4, pct: 13 },
                { reason: "Sem resposta ao contato", count: 2, pct: 6 },
              ].map(({ reason, count, pct }) => (
                <div key={reason} className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-red-600 mb-1">{count}</div>
                  <div className="text-[11px] text-gray-600 leading-tight mb-2">{reason}</div>
                  <div className="text-[10px] text-red-400 font-semibold">{pct}% dos casos</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 8 — Smart Search ────────────────────────────────────────────────
function SmartSearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<null | typeof contacts>(null);

  const examples = [
    "Clientes interessados em Caribe para janeiro",
    "Clientes que pediram orçamento e não receberam retorno",
    "Clientes recorrentes sem contato há mais de 1 ano",
    "Clientes com probabilidade acima de 80%",
    "Leads quentes sem follow-up esta semana",
    "Famílias com crianças interessadas em Disney Cruise",
  ];

  const doSearch = (q: string) => {
    setQuery(q);
    setResults(contacts.slice(0, 3));
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Pesquise em linguagem natural..."
              className="w-full pl-12 pr-32 py-4 bg-white border border-gray-200 rounded-xl text-[15px] text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
              onKeyDown={e => e.key === "Enter" && doSearch(query)}
            />
            <button
              onClick={() => doSearch(query)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors"
            >
              Buscar
            </button>
          </div>

          {!results && (
            <>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Exemplos de busca</p>
              <div className="flex flex-wrap gap-2 mb-8">
                {examples.map(ex => (
                  <button
                    key={ex}
                    onClick={() => doSearch(ex)}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px] text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-[#2563EB] transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
              <div className="bg-[#0F1629] rounded-xl p-6 text-center">
                <Brain className="w-10 h-10 text-[#2563EB] mx-auto mb-3" />
                <h3 className="text-white font-semibold text-[15px] mb-1">Busca com Inteligência Artificial</h3>
                <p className="text-white/45 text-[12px] leading-relaxed max-w-sm mx-auto">
                  Use linguagem natural para encontrar contatos, oportunidades e padrões em toda a sua base de clientes.
                </p>
              </div>
            </>
          )}

          {results && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] text-gray-500">
                  <strong className="text-gray-900">{results.length} resultados</strong> para &ldquo;{query}&rdquo;
                </p>
                <button onClick={() => { setResults(null); setQuery(""); }} className="text-[12px] text-gray-400 hover:text-gray-700 flex items-center gap-1">
                  <X className="w-3.5 h-3.5" /> Limpar
                </button>
              </div>
              <div className="space-y-3">
                {results.map(r => (
                  <div
                    key={r.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:border-blue-200 cursor-pointer transition-all"
                  >
                    <Avatar name={r.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-gray-900">{r.name}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{r.interest} · {r.nextTrip}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Última interação: {r.lastInteraction}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={r.status} />
                      <ScoreBar score={r.score} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 9 — Reports ─────────────────────────────────────────────────────
function ReportsScreen() {
  const rows = [
    { name: "Marcelo Santos", last: "15 dias", interest: "Alaska · Princess", reason: "Orçamento enviado sem retorno", chance: 52, action: "Ligar com nova proposta de valor" },
    { name: "Patricia Gomes", last: "1 mês", interest: "Mediterrâneo · Costa", reason: "Perdeu interesse por preço elevado", chance: 28, action: "Oferecer desconto de reativação" },
    { name: "Carlos Mendes", last: "3 semanas", interest: "Caribe · Royal Caribbean", reason: "Aguardando aprovação da família", chance: 64, action: "WhatsApp urgente — janela fecha em 5 dias" },
    { name: "Sonia Ramos", last: "10 dias", interest: "Caribe · MSC", reason: "Não visualizou a mensagem enviada", chance: 71, action: "Ligar agora — cliente com histórico de compra" },
    { name: "Felipe Nunes", last: "8 dias", interest: "Bahamas · Norwegian", reason: "Pediu prazo de 10 dias para decidir", chance: 59, action: "Reforçar urgência da promoção atual" },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Oportunidades Esquecidas", value: "31", color: "text-red-500", bg: "bg-red-50 border-red-100" },
            { label: "Potencial em Risco", value: "R$ 620K", color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
            { label: "Chance Média de Recuperação", value: "54%", color: "text-[#2563EB]", bg: "bg-blue-50 border-blue-100" },
            { label: "Recuperações Este Mês", value: "7", color: "text-green-600", bg: "bg-green-50 border-green-100" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} border rounded-xl p-4`}>
              <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
              <div className="text-[12px] text-gray-600">{label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-[14px]">Oportunidades Esquecidas</h3>
              <p className="text-[11px] text-gray-400">Contatos que precisam de follow-up urgente</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] text-white rounded-lg text-[12px] font-semibold hover:bg-[#1d4ed8]">
              <ArrowRight className="w-3.5 h-3.5" /> Follow-up em lote
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["Cliente", "Último Contato", "Interesse", "Motivo", "Chance", "Ação Sugerida", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-[11px] font-bold flex-shrink-0">
                        {r.name.split(" ").slice(0, 2).map(n => n[0]).join("")}
                      </div>
                      <span className="text-[13px] font-semibold text-gray-900 whitespace-nowrap">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full font-medium">{r.last}</span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-gray-600 whitespace-nowrap">{r.interest}</td>
                  <td className="px-4 py-3 text-[11px] text-gray-500 max-w-[180px]">{r.reason}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[13px] font-bold ${r.chance >= 70 ? "text-green-600" : r.chance >= 50 ? "text-amber-600" : "text-red-500"}`}>
                      {r.chance}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-gray-600 max-w-[200px]">{r.action}</td>
                  <td className="px-4 py-3">
                    <button className="px-3 py-1 bg-[#2563EB] text-white rounded-lg text-[11px] font-semibold hover:bg-[#1d4ed8] whitespace-nowrap">
                      Contatar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 10 — Settings ───────────────────────────────────────────────────
function SettingsScreen() {
  const [tab, setTab] = useState("whatsapp");

  const TABS = [
    { id: "whatsapp", label: "Integração WhatsApp", icon: MessageSquare },
    { id: "users", label: "Usuários", icon: Users },
    { id: "permissions", label: "Permissões", icon: Shield },
    { id: "score", label: "Regras de Score", icon: Sliders },
    { id: "automations", label: "Automações", icon: BellRing },
    { id: "ai", label: "Preferências da IA", icon: Cpu },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        <div className="flex gap-6">
          <nav className="w-48 flex-shrink-0 space-y-0.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  tab === id ? "bg-[#2563EB] text-white" : "text-gray-600 hover:bg-white hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-[12px] font-medium">{label}</span>
              </button>
            ))}
          </nav>

          <div className="flex-1">
            {tab === "whatsapp" && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
                <div>
                  <h3 className="font-semibold text-gray-900 text-[15px]">Integração WhatsApp</h3>
                  <p className="text-[12px] text-gray-400 mt-0.5">Configure a conexão com seu número WhatsApp Business</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center">
                      <Wifi className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-green-800">Conectado e sincronizando</div>
                      <div className="text-[11px] text-green-600">+55 11 9999-0000 · WhatsApp Business API</div>
                    </div>
                  </div>
                  <span className="text-[11px] bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded-full font-semibold">Ativo</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Número WhatsApp", value: "+55 11 9999-0000" },
                    { label: "Versão da API", value: "v18.0" },
                    { label: "Token de Acesso", value: "EAAxxxxxxxxxxxxxxxx" },
                    { label: "Webhook URL", value: "https://api.cruisecrm.com/wh/" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                      <input
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                        defaultValue={value}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8]">Salvar Alterações</button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-[13px] font-medium hover:bg-gray-200">Testar Conexão</button>
                </div>
              </div>
            )}

            {tab === "users" && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-[15px]">Usuários</h3>
                    <p className="text-[12px] text-gray-400">3 de 5 licenças utilizadas</p>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8]">
                    <Plus className="w-4 h-4" /> Convidar usuário
                  </button>
                </div>
                <div className="space-y-2">
                  {[
                    { name: "Carlos Silva", email: "carlos@agencia.com", role: "Admin", status: "Ativo" },
                    { name: "Mariana Costa", email: "mariana@agencia.com", role: "Consultor", status: "Ativo" },
                    { name: "Pedro Alves", email: "pedro@agencia.com", role: "Consultor", status: "Ativo" },
                  ].map(({ name, email, role, status }) => (
                    <div key={email} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar name={name} />
                        <div>
                          <div className="text-[13px] font-semibold text-gray-900">{name}</div>
                          <div className="text-[11px] text-gray-400">{email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{role}</span>
                        <span className="text-[11px] bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full">{status}</span>
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "ai" && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 text-[15px]">Preferências da IA</h3>
                <p className="text-[12px] text-gray-400 mt-0.5 mb-5">Configure como a inteligência artificial analisa e prioriza oportunidades</p>
                <div className="space-y-4">
                  {[
                    { label: "Sensibilidade de Score", desc: "Ajuste a sensibilidade do algoritmo de pontuação de leads", value: 70 },
                    { label: "Frequência de Análise", desc: "Com que frequência a IA analisa novas conversas recebidas", value: 85 },
                    { label: "Threshold de Alerta", desc: "Probabilidade mínima para gerar alerta de oportunidade", value: 60 },
                  ].map(({ label, desc, value }) => (
                    <div key={label} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <div className="text-[13px] font-semibold text-gray-900">{label}</div>
                          <div className="text-[11px] text-gray-400">{desc}</div>
                        </div>
                        <span className="text-[15px] font-bold text-[#2563EB]">{value}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-[#2563EB] rounded-full transition-all" style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
                  <button className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8]">
                    Salvar Preferências
                  </button>
                </div>
              </div>
            )}

            {["score", "permissions", "automations"].includes(tab) && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center min-h-[280px]">
                <Sliders className="w-12 h-12 text-gray-200 mb-3" />
                <h3 className="text-[14px] font-semibold text-gray-500">Em desenvolvimento</h3>
                <p className="text-[12px] text-gray-400 mt-1">Esta seção estará disponível em breve</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Screen metadata ────────────────────────────────────────────────────────
const META: Record<Screen, { title: string; subtitle: string }> = {
  login: { title: "", subtitle: "" },
  dashboard: { title: "Dashboard", subtitle: "Visão geral comercial · Segunda, 23 Dez 2024" },
  crm: { title: "Contatos", subtitle: "Gerencie sua base de clientes e leads" },
  profile: { title: "Perfil do Cliente", subtitle: "Ana Paula Ferreira · Score 94" },
  timeline: { title: "Timeline da Conversa", subtitle: "Ana Paula Ferreira" },
  kanban: { title: "Central de Oportunidades", subtitle: "Pipeline comercial · 23 oportunidades ativas" },
  insights: { title: "Insights de IA", subtitle: "Análise inteligente do seu funil de vendas" },
  "smart-search": { title: "Busca Inteligente", subtitle: "Pesquise sua base em linguagem natural" },
  reports: { title: "Relatórios e Follow-up", subtitle: "Oportunidades esquecidas e recuperação de leads" },
  settings: { title: "Configurações", subtitle: "Integração, usuários e preferências da IA" },
};

// ── App root ───────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("login");

  if (screen === "login") {
    return (
      <div className="h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <LoginScreen onLogin={() => setScreen("dashboard")} />
      </div>
    );
  }

  return (
    <div className="h-screen flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar screen={screen} onNavigate={setScreen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar {...META[screen]} />
        {screen === "dashboard" && <DashboardScreen onNavigate={setScreen} />}
        {screen === "crm" && <CRMScreen onNavigate={setScreen} />}
        {screen === "profile" && <ProfileScreen onNavigate={setScreen} />}
        {screen === "timeline" && <TimelineScreen />}
        {screen === "kanban" && <KanbanScreen />}
        {screen === "insights" && <InsightsScreen />}
        {screen === "smart-search" && <SmartSearchScreen />}
        {screen === "reports" && <ReportsScreen />}
        {screen === "settings" && <SettingsScreen />}
      </div>
    </div>
  );
}
