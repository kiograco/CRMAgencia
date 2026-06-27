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

## Regras Criticas

- Toda regra de negocio deve usar `companyId` vindo da autenticacao.
- Nunca confiar em `companyId` enviado pelo frontend.
- Nunca retornar `passwordHash`, tokens ou segredos.
- Criar testes para isolamento multiempresa antes de expor CRUDs reais.
