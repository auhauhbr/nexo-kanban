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

## Endpoints atuais

- `GET /health`: confirma que a API esta online
