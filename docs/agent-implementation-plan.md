# Plano De Implementacao Para Agente

Este documento descreve o caminho mais rapido para transformar o wireframe atual em um CRM SaaS funcional.

## Diagnostico

O projeto atual e um prototipo visual React/Vite. A maior parte da experiencia esta em `src/app/App.tsx`, usando dados mockados em arrays locais e navegacao controlada por estado.

Nao ha backend, banco, autenticacao real, permissoes, multiempresa, testes ou integracoes.

Portanto, a tarefa nao e apenas completar funcoes isoladas. A tarefa principal e criar a fundacao funcional do produto e conectar o wireframe existente a essa fundacao.

## Meta Do MVP

Entregar um CRM SaaS minimo, funcional e seguro, com:

- autenticacao;
- empresas/tenants;
- usuarios;
- contatos;
- oportunidades em kanban;
- historico de interacoes;
- tarefas/follow-ups;
- dashboard com dados reais;
- auditoria basica;
- testes de isolamento multiempresa.

## Fase 0: Preparacao

1. Instalar dependencias atuais do wireframe.
2. Confirmar que o frontend atual compila.
3. Separar o `src/app/App.tsx` em componentes apenas quando isso for necessario para ligar dados reais.
4. Criar `.env.example` para variaveis futuras.
5. Criar `docker-compose.yml` com PostgreSQL e Redis opcional.

Variaveis minimas:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://crm:crm@localhost:5432/crm_dev
JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me
COOKIE_SECRET=change-me
CORS_ORIGIN=http://localhost:5173
REDIS_URL=redis://localhost:6379
```

## Fase 1: Backend Base

Criar pasta `backend/` com:

```text
backend/
  src/
    app.ts
    server.ts
    config/
    database/
    middlewares/
    modules/
    shared/
    tests/
  package.json
  tsconfig.json
  jest.config.ts
```

Tecnologias recomendadas:

- Node.js;
- TypeScript;
- Express;
- Sequelize ou Prisma;
- PostgreSQL;
- Zod para validacao;
- Jest e Supertest;
- bcrypt/argon2 para senha;
- JWT em cookie `httpOnly`.

Rotas minimas:

```text
POST /auth/login
POST /auth/logout
GET  /auth/me

GET    /contacts
POST   /contacts
GET    /contacts/:id
PATCH  /contacts/:id
DELETE /contacts/:id

GET    /deals
POST   /deals
PATCH  /deals/:id
PATCH  /deals/:id/stage
DELETE /deals/:id

GET    /dashboard/summary
GET    /audit-logs
```

## Fase 2: Modelos De Dados

Criar os modelos iniciais:

### Company

Campos:

- `id`;
- `name`;
- `document`;
- `status`;
- `createdAt`;
- `updatedAt`.

### User

Campos:

- `id`;
- `companyId`;
- `name`;
- `email`;
- `passwordHash`;
- `role`;
- `status`;
- `lastLoginAt`;
- `createdAt`;
- `updatedAt`.

Regras:

- email unico por empresa ou unico global, conforme decisao de produto;
- nunca retornar `passwordHash`;
- roles iniciais: `owner`, `admin`, `manager`, `agent`.

### Contact

Campos:

- `id`;
- `companyId`;
- `name`;
- `email`;
- `phone`;
- `status`;
- `score`;
- `interest`;
- `nextTrip`;
- `consultantId`;
- `createdAt`;
- `updatedAt`;
- `deletedAt`.

### Deal

Campos:

- `id`;
- `companyId`;
- `contactId`;
- `ownerId`;
- `stage`;
- `title`;
- `destination`;
- `value`;
- `probability`;
- `nextAction`;
- `expectedCloseAt`;
- `status`;
- `createdAt`;
- `updatedAt`.

### Interaction

Campos:

- `id`;
- `companyId`;
- `contactId`;
- `dealId`;
- `userId`;
- `type`;
- `body`;
- `occurredAt`;
- `createdAt`.

### Task

Campos:

- `id`;
- `companyId`;
- `contactId`;
- `dealId`;
- `userId`;
- `title`;
- `dueAt`;
- `status`;
- `createdAt`;
- `updatedAt`.

### AuditLog

Campos:

- `id`;
- `companyId`;
- `userId`;
- `action`;
- `entity`;
- `entityId`;
- `metadata`;
- `ipAddress`;
- `userAgent`;
- `createdAt`.

Regra:

- `metadata` nao pode conter senha, token, segredo, cookie ou payload sensivel.

## Fase 3: Multiempresa

Implementar `authMiddleware` e `tenantMiddleware`.

O request autenticado deve carregar:

```ts
req.user = {
  id: string;
  companyId: string;
  role: string;
}
```

Toda query de dados de negocio deve incluir `companyId`.

Exemplos obrigatorios:

```ts
where: {
  id: params.id,
  companyId: req.user.companyId,
}
```

Nunca aceitar `companyId` enviado pelo frontend para decidir tenant da operacao. O `companyId` confiavel deve vir da sessao/token validado.

## Fase 4: Frontend Ligado A API

Criar camada:

```text
src/app/services/apiClient.ts
src/app/services/authService.ts
src/app/services/contactService.ts
src/app/services/dealService.ts
src/app/services/dashboardService.ts
```

Regras:

- usar `fetch` ou cliente HTTP centralizado;
- usar `credentials: "include"` se a autenticacao usar cookie;
- tratar `401` redirecionando para login;
- remover mocks gradualmente;
- nao salvar token sensivel em `localStorage`.

Primeiras telas a conectar:

1. Login.
2. Dashboard.
3. Contatos.
4. Kanban de oportunidades.
5. Perfil do contato.
6. Timeline de interacoes.

## Fase 5: Testes Obrigatorios Do MVP

Criar testes backend com Jest/Supertest.

Cenarios minimos:

1. Usuario autenticado lista apenas contatos da propria empresa.
2. Usuario nao consegue acessar contato de outra empresa por ID.
3. Usuario nao consegue atualizar contato de outra empresa.
4. Usuario nao consegue deletar contato de outra empresa.
5. Oportunidades respeitam `companyId`.
6. Login nao retorna `passwordHash`.
7. Endpoints protegidos retornam `401` sem autenticacao.
8. Auditoria registra criacao/edicao/exclusao sem dados sensiveis.

## Fase 6: Auditoria E Permissoes

Implementar matriz inicial:

```text
owner   : tudo na empresa
admin   : tudo exceto billing/destruicao da empresa
manager : leitura geral, escrita em contatos/oportunidades, relatorios
agent   : leitura/escrita nos proprios contatos e oportunidades
```

Acoes com auditoria:

- login;
- logout;
- criar contato;
- atualizar contato;
- excluir contato;
- criar oportunidade;
- mover oportunidade de etapa;
- fechar oportunidade;
- alterar usuario;
- alterar permissao.

## Fase 7: Relatorios Basicos

Implementar endpoints:

```text
GET /dashboard/summary
GET /reports/conversion
GET /reports/deals-by-stage
GET /reports/agent-performance
```

Todos devem filtrar por `companyId`.

Metricas iniciais:

- total de contatos;
- contatos novos no periodo;
- oportunidades abertas;
- oportunidades ganhas;
- valor total em pipeline;
- taxa de conversao;
- tarefas vencidas;
- contatos sem interacao recente.

## Fase 8: Conversas E Atendimento

Depois do MVP, criar:

- `Conversation`;
- `Message`;
- `Queue`;
- atribuicao de atendente;
- status da conversa;
- SLA basico.

Nao integrar WhatsApp real no primeiro passo. Criar provider abstrato e mocks.

## Fase 9: Campanhas

Criar:

- listas segmentadas;
- campanhas;
- templates;
- envios mockados;
- opt-out;
- logs de envio.

Regras:

- respeitar LGPD;
- nao enviar para contatos com opt-out;
- registrar auditoria.

## Fase 10: Pagamentos E Assinatura

Criar somente depois do CRM basico estar funcional.

Modelos:

- `Plan`;
- `Subscription`;
- `PaymentEvent`;

Regras criticas:

- webhooks devem validar HMAC;
- validar timestamp;
- implementar protecao contra replay;
- implementar idempotencia;
- bloquear funcionalidades quando assinatura estiver expirada;
- nao registrar payload sensivel no log.

## Checklist De Primeiro PR Funcional

O primeiro PR realmente funcional deve conter:

- `backend/` criado;
- `docker-compose.yml` com PostgreSQL;
- migracoes/modelos de `Company`, `User`, `Contact`, `Deal` e `AuditLog`;
- login/logout;
- middleware de autenticacao;
- middleware de tenant;
- CRUD de contatos;
- CRUD basico de oportunidades;
- testes de isolamento multiempresa;
- frontend consultando contatos reais;
- README atualizado com comandos.

## Criterios De Aceite

O trabalho so deve ser considerado pronto quando:

- a aplicacao sobe localmente;
- login funciona;
- contatos persistem no banco;
- oportunidades persistem no banco;
- uma empresa nao acessa dados de outra;
- endpoints protegidos bloqueiam usuario nao autenticado;
- testes principais passam;
- nenhum segredo e exposto no frontend;
- documentacao de execucao esta atualizada.

## Observacoes Para O Agente

Nao tente implementar todas as funcionalidades de uma vez. O risco maior esta em criar muitas telas sem fundacao segura. Primeiro torne contato e oportunidade reais, com tenant forte e testes. Depois evolua conversas, campanhas, IA, delivery, pagamentos e webhooks.
