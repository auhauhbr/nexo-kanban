# Projeto Kanban

Aplicação full stack de gestão de tarefas com quadros, listas, cartões, arrastar e soltar e atualizações em tempo real.

## Stack planejada

- Frontend: React, TypeScript, Vite, TanStack Query e dnd-kit
- Backend: Node.js, Express, TypeScript, Prisma e Socket.io
- Banco de dados: PostgreSQL 16

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior
- Docker Desktop para executar o PostgreSQL localmente

## Primeiros comandos

Instale as dependências:

```bash
npm install
```

## Executar com Docker

Para iniciar apenas o PostgreSQL e desenvolver o backend e o frontend pelo
terminal:

```bash
docker compose up -d db
npm run dev:backend
npm run dev:frontend
```

Para construir e iniciar a aplicação completa em contêineres:

```bash
docker compose up -d --build
```

Depois, acesse:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3333`
- Saúde da API: `http://localhost:3333/health`

Ao iniciar o backend em contêiner, as migrações pendentes do Prisma são
aplicadas automaticamente. Para acompanhar os serviços:

```bash
docker compose ps
docker compose logs -f
```

Para encerrar os serviços sem apagar os dados:

```bash
docker compose down
```

Crie o arquivo de ambiente do backend:

```powershell
Copy-Item backend/.env.example backend/.env
```

Inicie somente o backend:

```bash
npm run dev:backend
```

Inicie somente o frontend:

```bash
npm run dev:frontend
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

Execute os testes automatizados:

```bash
npm test
```

## Endpoints atuais

- `GET /health`: confirma que a API e o PostgreSQL estão online
- `POST /auth/register`: cria uma conta e retorna um JWT
- `POST /auth/login`: autentica uma conta e retorna um JWT
- `GET /auth/me`: retorna o usuário autenticado
- `GET /boards`: lista os quadros do usuário
- `POST /boards`: cria um quadro
- `GET /boards/:id`: retorna um quadro com listas e cartões
- `PATCH /boards/:id`: atualiza um quadro
- `DELETE /boards/:id`: remove um quadro
- `POST /boards/:boardId/lists`: cria uma lista no final do quadro
- `PATCH /lists/:id`: atualiza título ou posição de uma lista
- `DELETE /lists/:id`: remove uma lista
- `POST /lists/:listId/cards`: cria um cartão no final da lista
- `PATCH /cards/:id`: atualiza ou move um cartão
- `DELETE /cards/:id`: remove um cartão

## Eventos em tempo real

- A conexão Socket.io exige o JWT em `auth.token`
- `join-board`: entra com segurança na sala de um quadro
- `board:updated`: solicita a sincronização dos dados do quadro
- Eventos específicos: `board:changed`, `board:deleted`, `list:created`, `list:updated`, `list:deleted`, `card:created`, `card:updated` e `card:deleted`

## Convenção de nomes

Pastas, arquivos, funções, variáveis e mensagens próprias do projeto são escritos em português sempre que isso deixa o código claro.

Contratos externos permanecem no formato esperado pelas ferramentas e integrações. Isso inclui rotas como `/boards`, campos da API e do Prisma como `boardId` e métodos de bibliotecas como `$transaction`.
