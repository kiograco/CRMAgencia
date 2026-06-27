# Backend Cruise CRM

Backend inicial para o CRM SaaS multiempresa.

## Comandos

```bash
npm install
npm run dev
npm run build
npm run test:unit
npm run test:integration
```

## Banco Local

Na raiz do projeto:

```bash
docker compose up -d postgres
```

Variaveis esperadas estao em `../.env.example`.

O PostgreSQL do projeto usa a porta `55432` no host para evitar conflito com bancos locais na porta `5432`.

## Usuario Dev

Em `development`, o backend cria automaticamente uma empresa e um usuario admin fake:

```text
email: admin@demo.local
senha: Admin123!demo
```

Essas credenciais sao apenas para desenvolvimento local e podem ser alteradas via `DEV_ADMIN_EMAIL` e `DEV_ADMIN_PASSWORD`.

## Regras Criticas

- Toda regra de negocio deve usar `companyId` vindo da autenticacao.
- Nunca confiar em `companyId` enviado pelo frontend.
- Nunca retornar `passwordHash`, tokens ou segredos.
- Criar testes para isolamento multiempresa antes de expor CRUDs reais.
