# Nexo

Nexo é uma aplicação Kanban full stack para organizar projetos em quadros,
listas e cartões. O sistema possui autenticação, movimentação por arrastar e
soltar, atualização em tempo real e ambiente completo com Docker.

## Funcionalidades

- Cadastro, login e sessão autenticada com JWT
- Criação, edição e exclusão de quadros
- Criação, renomeação, reordenação e exclusão de listas
- Criação, edição, movimentação e exclusão de cartões
- Arrastar e soltar cartões entre listas
- Atualizações em tempo real com salas privadas por quadro
- Interface responsiva com estados de carregamento, erro e notificações
- Testes de integração da API e testes das regras de movimentação
- Validação automática com GitHub Actions

## Tecnologias

### Frontend

O frontend é uma aplicação React criada com Vite. Ele é responsável pelas
telas de autenticação, painel de quadros e área Kanban, além das interações de
criação, edição, exclusão e arrastar e soltar.

- **React:** estrutura a interface em páginas, contextos e componentes
  reutilizáveis.
- **TypeScript:** tipa componentes, propriedades, respostas da API, quadros,
  listas, cartões e funções de movimentação.
- **Vite:** executa o ambiente de desenvolvimento e gera o build de produção.
- **TanStack Query:** busca dados da API, gerencia cache, refaz consultas e
  permite atualizações otimistas durante movimentações.
- **Axios:** centraliza as requisições HTTP e adiciona o token JWT às rotas
  protegidas.
- **React Router:** controla as páginas públicas e protegidas.
- **Socket.io Client:** recebe atualizações do quadro sem recarregar a página.
- **Lucide React:** fornece os ícones da interface.

### Backend

O backend concentra as regras de negócio e expõe uma API REST. Ele verifica a
identidade do usuário, protege o acesso aos dados e mantém as posições de
listas e cartões consistentes durante as movimentações.

- **Node.js:** ambiente de execução da API.
- **Express:** organiza rotas, controladores e intermediários HTTP.
- **TypeScript:** tipa entradas, serviços, respostas, autenticação e integração
  com o Prisma.
- **Zod:** valida os dados recebidos antes de executar as regras de negócio.
- **JWT:** autentica requisições e conexões em tempo real.
- **bcryptjs:** protege as senhas antes de armazená-las.
- **Socket.io:** publica alterações somente para os clientes autorizados na
  sala de cada quadro.

### Banco de dados

- **PostgreSQL:** armazena usuários, quadros, listas e cartões em um modelo
  relacional.
- **Prisma ORM:** define o modelo de dados, gera o cliente tipado, executa
  consultas e controla as migrações do banco.
- **Transações:** preservam a ordenação de listas e cartões durante alterações
  que atualizam vários registros.

### Docker e execução

- **Docker Compose:** inicia PostgreSQL, backend e frontend como serviços
  separados e conectados.
- **Dockerfile do backend:** gera o cliente Prisma, compila o TypeScript, aplica
  migrações pendentes e inicia a API.
- **Dockerfile do frontend:** gera o build de produção da aplicação React.
- **Nginx:** serve os arquivos do frontend e mantém as rotas do React
  disponíveis ao atualizar a página.
- **Volumes:** preservam os dados do PostgreSQL mesmo após encerrar os
  contêineres.

### Testes e qualidade

- **Node Test Runner:** executa os testes automatizados.
- **Testes de integração:** validam autenticação, autorização, CRUD, ordenação e
  eventos em tempo real usando o banco.
- **Testes do frontend:** validam as regras de movimentação de listas e cartões.
- **GitHub Actions:** cria um PostgreSQL temporário e executa migrações, testes,
  verificação de tipos e build a cada envio ao GitHub.

## Desenvolvimento e assistência de IA

O projeto foi desenvolvido como um estudo prático de arquitetura full stack,
com foco na construção do backend em TypeScript, regras de negócio,
autenticação, banco PostgreSQL, integração em tempo real, testes e
containerização com Docker.

Ferramentas de inteligência artificial foram utilizadas como apoio no
refinamento do frontend, principalmente em decisões de apresentação visual,
responsividade, organização de componentes e melhorias de experiência do
usuário. A assistência foi aplicada sobre a estrutura funcional do sistema e
não substitui a implementação da API, da modelagem do banco, das regras do
backend ou da infraestrutura Docker.

## Arquitetura

```mermaid
flowchart LR
    U[Usuário] --> F[Frontend React + Nginx]
    F -->|API REST + JWT| B[Backend Express]
    F <-->|Socket.io| B
    B --> P[(PostgreSQL)]
```

O frontend utiliza a API REST para persistir alterações e o Socket.io para
receber atualizações do quadro em tempo real. Cada conexão só pode entrar nas
salas dos quadros pertencentes ao usuário autenticado.

## Executar com Docker

### Aplicação completa

Com o Docker Desktop em execução:

```bash
docker compose up -d --build
```

Depois, acesse:

- Aplicação: `http://localhost:5173`
- API: `http://localhost:3333`
- Saúde da API: `http://localhost:3333/health`

As migrações pendentes do Prisma são aplicadas automaticamente ao iniciar o
backend.

Para acompanhar ou encerrar os serviços:

```bash
docker compose ps
docker compose logs -f
docker compose down
```

O comando `docker compose down` não apaga os dados armazenados no volume do
PostgreSQL.

## Desenvolvimento local

### Requisitos

- Node.js 20 ou superior
- npm 10 ou superior
- Docker Desktop

Instale as dependências e crie o arquivo de ambiente do backend:

```bash
npm install
```

```powershell
Copy-Item backend/.env.example backend/.env
```

Inicie o banco:

```bash
docker compose up -d db
```

Em terminais separados, inicie a API e o frontend:

```bash
npm run dev:backend
npm run dev:frontend
```

## Comandos úteis

```bash
# Executa testes, verificação de tipos e build
npm run validar

# Executa somente os testes
npm test

# Cria e aplica uma nova migração
npm run db:migrate --workspace backend -- --name nome_da_migracao

# Abre a interface de dados do Prisma
npm run db:studio --workspace backend
```

## API

Todas as rotas, exceto cadastro e login, exigem o cabeçalho
`Authorization: Bearer <token>`.

| Método | Rota | Ação |
| --- | --- | --- |
| `POST` | `/auth/register` | Cria uma conta |
| `POST` | `/auth/login` | Autentica uma conta |
| `GET` | `/auth/me` | Retorna o usuário autenticado |
| `GET` | `/boards` | Lista os quadros do usuário |
| `POST` | `/boards` | Cria um quadro |
| `GET` | `/boards/:id` | Retorna um quadro com listas e cartões |
| `PATCH` | `/boards/:id` | Atualiza um quadro |
| `DELETE` | `/boards/:id` | Exclui um quadro |
| `POST` | `/boards/:boardId/lists` | Cria uma lista |
| `PATCH` | `/lists/:id` | Atualiza ou move uma lista |
| `DELETE` | `/lists/:id` | Exclui uma lista |
| `POST` | `/lists/:listId/cards` | Cria um cartão |
| `PATCH` | `/cards/:id` | Atualiza ou move um cartão |
| `DELETE` | `/cards/:id` | Exclui um cartão |
| `GET` | `/health` | Verifica a API e o banco |

## Tempo real

A conexão Socket.io exige o JWT em `auth.token`. Após a autenticação, o evento
`join-board` permite entrar somente na sala de um quadro pertencente ao usuário.

Alterações em quadros, listas e cartões são publicadas aos clientes conectados
à mesma sala. O frontend invalida o cache correspondente e sincroniza os dados
sem recarregar a página.

## Estrutura

```text
kanban-projeto/
├── backend/
│   ├── prisma/
│   └── src/
│       ├── configuracao/
│       ├── intermediarios/
│       ├── modulos/
│       ├── tempo-real/
│       └── testes/
├── frontend/
│   └── src/
│       ├── api/
│       ├── componentes/
│       ├── contexto/
│       ├── paginas/
│       ├── tempo-real/
│       └── testes/
├── .github/workflows/
└── docker-compose.yml
```

## Convenção de nomes

Pastas, arquivos, funções, variáveis e mensagens próprias do projeto são
escritos em português sempre que isso mantém o código claro.

Contratos externos permanecem no formato esperado pelas ferramentas e
integrações, incluindo rotas como `/boards`, campos do Prisma como `boardId` e
métodos de bibliotecas como `$transaction`.
