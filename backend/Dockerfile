FROM node:22-alpine AS dependencias

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json

RUN npm ci --ignore-scripts

FROM dependencias AS compilacao

COPY backend backend

RUN DATABASE_URL=postgresql://kanban:kanban@db:5432/kanban npm run db:generate --workspace backend \
  && npm run build --workspace backend

FROM node:22-alpine AS execucao

WORKDIR /app

ENV NODE_ENV=production

COPY --from=dependencias /app/node_modules node_modules
COPY --from=compilacao /app/package.json package.json
COPY --from=compilacao /app/backend/package.json backend/package.json
COPY --from=compilacao /app/backend/prisma.config.ts backend/prisma.config.ts
COPY --from=compilacao /app/backend/prisma backend/prisma
COPY --from=compilacao /app/backend/dist backend/dist

EXPOSE 3333

CMD ["sh", "-c", "npm run db:deploy --workspace backend && npm run start --workspace backend"]
