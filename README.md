
# 🍲 Receitas API – NestJS + TypeORM + MySQL

API RESTful desenvolvida com NestJS, TypeORM e MySQL para gerenciamento de receitas, com autenticação JWT, logging estruturado e monitoramento via Prometheus.

---

## 🚀 Como Rodar o Projeto

### 🔧 Pré-requisitos
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### 🧪 Ambiente via Docker (totalmente containerizado)

```bash
docker-compose up --build
```

Este comando:
- Sobe MySQL e a aplicação
- Roda as migrations automaticamente
- Inicia o backend na porta `3000`

### 💻 Rodar aplicação localmente (DB no Docker, app local)

1. Suba apenas o banco:
```bash
docker-compose up mysql_db
```

2. No `.env`, configure:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=password
DB_NAME=mydatabase
```

3. Rode local:
```bash
npm install
npm run start:dev
```

---

## 📌 Acesso à Aplicação

- **Backend (produção - Render):** https://recipes-backend-zqco.onrender.com/
- **Swagger:** https://recipes-backend-zqco.onrender.com/api/docs
- **Métricas Prometheus:** https://recipes-backend-zqco.onrender.com/metrics

---

## 🛠 Tecnologias Utilizadas

- **NestJS** 11
- **TypeORM** com **MySQL**
- **JWT + Passport**
- **Docker + Docker Compose**
- **Swagger (OpenAPI)**
- **Winston** + `nest-winston` (logger estruturado)
- **Prometheus** via `prom-client` + `/metrics`

---

## 📊 Métricas Prometheus

Disponíveis em `/metrics`:

- `receitas_criadas_total`
- `receitas_criacao_falha_total`
- `usuarios_criados_total`
- Métricas internas do Node.js (`nodejs_gc_duration_seconds_*`, etc.)

---

## 🧪 Testes

- **Testes unitários:** `npm run test`
  - Cobrem serviços, regras de negócio e comportamentos isolados
- **Testes e2e:** `npm run test:e2e`
  - Validam o comportamento dos endpoints da API
  - Para rodar os e2e localmente, suba apenas o mysql com `docker-compose up -d mysql_db`, e execute `npm run test:e2e:local`
- **Cobertura:** `npm run test:cov`

---

## 🗄 Migrations

- Gerar:
```bash
npm run typeorm migration:create src/database/migrations/NomeDaMigration
```

- Rodar:
```bash
npm run migration:run
```

- Reverter:
```bash
npm run migration:revert
```

---

## 🧱 Estrutura de Pastas (Resumo)

```
src/
├── common/           # Logger e métricas (Prometheus)
├── database/         # DataSource e migrations
├── modules/          # Domínios: auth, users, recipes, categories
│   └── recipes/
│       ├── controllers/
│       ├── dto/
│       ├── entities/
│       ├── repositories/
│       └── services/
├── app.module.ts     # Módulo principal
├── main.ts           # Bootstrap
```

---

## 📐 Arquitetura e Padrões

- **Modularização por domínio** (`modules/`)
- **Inversão de dependência** com serviços injetáveis
- **Separação de responsabilidades:** controller, service, repository
- **Gitflow simplificado:** use `feature/`, `fix/`, `hotfix/`, `release/`
- **Commits padronizados:** convencionados com prefixos como `feat:`, `fix:`, `test:`

---

## ✅ Status

✅ Produção estável  
🔐 Autenticação com JWT  
📦 Deploy contínuo via Render  
📊 Monitoramento com métricas Prometheus  
🧪 Cobertura de testes automatizada

---

> Desenvolvido por [Jhonatan Camargo](https://github.com/jhow98)
