# Instrucoes Para Agentes

Voce esta trabalhando no projeto `Wireframe Cruise Intelligence CRM`.

## Estado Atual Do Projeto

Este repositorio, no estado atual, nao contem a arquitetura SaaS completa descrita para o CRM multiempresa. Ele contem um prototipo visual React/Vite gerado a partir de Figma.

Arquivos principais atuais:

- `src/app/App.tsx`: contem praticamente toda a interface em um unico arquivo, com navegacao por `useState` e dados mockados.
- `src/main.tsx`: inicializa a aplicacao React.
- `src/app/components/ui/`: componentes UI gerados/disponiveis para reaproveitamento.
- `docs/`: documentacao auxiliar.

Nao foram encontrados neste workspace:

- backend Node.js/TypeScript com Express;
- Sequelize, Prisma ou outro ORM;
- PostgreSQL;
- frontend Vue/Quasar;
- autenticacao real;
- permissoes;
- isolamento multiempresa;
- testes backend ou E2E;
- integracoes reais;
- persistencia de dados.

## Objetivo

Transformar o wireframe atual em um CRM SaaS funcional o mais rapido possivel, sem perder os requisitos criticos de seguranca, multiempresa e auditoria.

O menor caminho recomendado e:

1. Preservar o visual atual como base de interface.
2. Criar backend funcional com autenticacao, empresas, usuarios, contatos e oportunidades.
3. Substituir dados mockados por chamadas reais de API.
4. Adicionar testes focados nos pontos de maior risco: autenticacao, permissoes e isolamento multiempresa.

## Regras Criticas

- Nunca quebrar isolamento multiempresa.
- Toda consulta, update e delete de dados de negocio deve validar `companyId`.
- Nao expor tokens, segredos, credenciais ou dados sensiveis no frontend, logs ou respostas publicas.
- Evitar `localStorage` para tokens sensiveis. Preferir cookie `httpOnly`, `secure` e `sameSite`.
- Registrar auditoria para acoes criticas sem armazenar senha, token ou payload sensivel.
- Sanitizar qualquer HTML ou texto rico exibido no frontend.
- Nao usar dados reais em desenvolvimento ou testes.
- Usar mocks para pagamento, WhatsApp, email, chatbot, upload e APIs externas.
- Manter alteracoes pequenas, focadas e compatíveis com build, lint e CI.

## Prioridade De Implementacao

Siga o plano detalhado em `docs/agent-implementation-plan.md`.

A ordem recomendada e:

1. Estrutura backend.
2. Banco e modelos base.
3. Autenticacao.
4. Tenant middleware.
5. CRUD de contatos.
6. Pipeline e oportunidades.
7. Frontend consumindo API.
8. Testes de isolamento multiempresa.
9. Auditoria.
10. Relatorios basicos.

## Padroes De Trabalho

- Antes de alterar, leia a estrutura existente.
- Use `rg` para localizar arquivos e referencias.
- Use `apply_patch` para edicoes manuais.
- Nao refatore arquivos nao relacionados.
- Nao reverta alteracoes existentes sem autorizacao explicita.
- Ao criar backend, organize por modulos de dominio.
- Ao tocar em regra critica, crie ou ajuste testes.

## Comandos Atuais

No projeto atual, existem apenas scripts Vite:

```bash
npm run dev
npm run build
```

Antes de executar, instale dependencias:

```bash
npm install
```

Quando o backend e o frontend funcionais forem criados, adicionar scripts equivalentes para:

```bash
npm --prefix backend run lint
npm --prefix backend run build
npm --prefix backend run test:unit
npm --prefix backend run test:integration
npm --prefix frontend run lint
npm --prefix frontend run test:e2e -- --project=chromium
```

## Entrega Esperada Do Primeiro Ciclo

O primeiro ciclo de implementacao deve entregar:

- backend executavel;
- banco PostgreSQL configurado via Docker Compose;
- login/logout funcional;
- modelo `Company`;
- modelo `User`;
- CRUD de contatos com `companyId`;
- pipeline de oportunidades com `companyId`;
- frontend usando API real nos modulos principais;
- testes automatizados provando que uma empresa nao acessa dados de outra.
