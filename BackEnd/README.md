# MindCare API (NestJS + Prisma)
API REST com autenticação JWT (bcrypt), papéis (ADMIN, USER, HELPER), cadastro/login, profissionais e agendamentos.

## Rodar com SQLite (dev rápido)
1. Copie `.env.example` para `.env` e defina `DATABASE_URL="file:./dev.db"` e `DB_PROVIDER="sqlite"`.
2. `npm i`
3. `npm run prisma:generate`
4. `npm run prisma:migrate -- --name init`
5. `npm run seed`
6. `npm run dev`

Swagger: http://localhost:3000/api

## Rodar com Postgres (deploy)
- Use `docker-compose up -d`
- Em `.env`, use `DB_PROVIDER="postgresql"` e `DATABASE_URL` do compose.

## Cargos (roles)
- ADMIN: tudo
- HELPER: gerencia agenda/profissionais
- USER: cria e vê os próprios agendamentos

## Google OAuth (planejado)
- Esqueleto de Strategy incluso (comentado) para futura integração.


### Observação Prisma provider
- O Prisma **não permite** `env()` no `provider`.
- DEV: `provider = "sqlite"` (padrão).
- PROD: altere manualmente para `"postgresql"` e use `DATABASE_URL` de Postgres.
