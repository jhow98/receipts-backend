FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app /app
RUN npm install --omit=dev

# Executa migrations e inicia a aplicação
CMD npm run migration:run && npm run start:prod
