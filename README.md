# Kanban Projeto

Aplicacao full stack de gestao de tarefas com quadros, listas, cartoes, drag-and-drop e atualizacoes em tempo real.

## Stack planejada

- Frontend: React, TypeScript, Vite, TanStack Query e dnd-kit
- Backend: Node.js, Express, TypeScript, Prisma e Socket.io
- Banco de dados: PostgreSQL 16

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior
- Docker Desktop para executar o PostgreSQL localmente

## Primeiros comandos

Instale as dependencias:

```bash
npm install
```

Crie o arquivo de ambiente do backend:

```powershell
Copy-Item backend/.env.example backend/.env
```

Inicie somente o backend:

```bash
npm run dev:backend
```

Quando o Docker Desktop estiver instalado, inicie o banco:

```bash
docker compose up -d
```

Crie e aplique uma migration:

```bash
npm run db:migrate --workspace backend -- --name nome_da_migration
```

Abra o Prisma Studio para visualizar os dados:

```bash
npm run db:studio --workspace backend
```

## Endpoints atuais

- `GET /health`: confirma que a API e o PostgreSQL estao online
- `POST /auth/register`: cria uma conta e retorna um JWT
- `POST /auth/login`: autentica uma conta e retorna um JWT
- `GET /auth/me`: retorna o usuario autenticado
- `GET /boards`: lista os quadros do usuario
- `POST /boards`: cria um quadro
- `GET /boards/:id`: retorna um quadro com listas e cartoes
- `PATCH /boards/:id`: atualiza um quadro
- `DELETE /boards/:id`: remove um quadro
- `POST /boards/:boardId/lists`: cria uma lista no final do quadro
- `PATCH /lists/:id`: atualiza titulo ou posicao de uma lista
- `DELETE /lists/:id`: remove uma lista
