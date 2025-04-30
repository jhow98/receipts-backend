# 🍲 Receitas API - NestJS + TypeORM + MySQL

Este projeto é uma API REST para cadastro e gestão de receitas, desenvolvida com NestJS, TypeORM e MySQL.

---

## 🚀 Como rodar

### 1. Requisitos

- Docker
- Docker Compose

---

### 2. Configuração do ambiente

Crie um arquivo `.env` com base no `.env.example`:

```bash
cp .env.example .env
```

---

### 3. Subir o ambiente

```bash
docker-compose up --build
```

Este comando:

- Instala as dependências
- Compila o projeto (`npm run build`)
- Executa as migrations automaticamente (`npm run migration:run`)
- Inicia a aplicação (`npm run start:prod`)

---

### 4. Documentação da API

Após subir a aplicação, acesse:

```
http://localhost:3000/api
```

---

### 5. Banco de Dados

- Host: `localhost` (fora do container) ou `mysql_db` (dentro do container)
- Porta: `3306`
- Usuário: `root`
- Senha: `password`
- Banco: `mydatabase`

---

### 6. Comandos úteis

#### Gerar uma migration automaticamente

```bash
npm run migration:generate -- src/database/migrations/NomeDaMigration
```

> Isso criará a migration com base nas entidades TypeORM.

#### Rodar migrations manualmente

```bash
npm run migration:run
```

#### Reverter última migration

```bash
npm run migration:revert
```

---

## 🧩 Estrutura do projeto

```
src/
├── database/
│   ├── data-source.ts
│   └── migrations/
├── modules/
│   ├── users/
│   ├── recipes/
│   └── categories/
```

---

## 🧪 Testes

```bash
npm run test
```

---

## 📦 Build local sem Docker (opcional)

```bash
npm install
npm run build
npm run start:prod
```

---

## 🛠 Tecnologias

- NestJS
- TypeORM
- MySQL
- Docker + Docker Compose