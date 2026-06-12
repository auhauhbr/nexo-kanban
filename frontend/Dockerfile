FROM node:22-alpine AS compilacao

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json

RUN npm ci --ignore-scripts

COPY frontend frontend

ARG VITE_API_URL=http://localhost:3333
ARG VITE_SOCKET_URL=http://localhost:3333

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

RUN npm run build --workspace frontend

FROM nginx:1.27-alpine AS execucao

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=compilacao /app/frontend/dist /usr/share/nginx/html

EXPOSE 80
