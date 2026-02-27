<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

 # 🚀 Dev Hub API
 <p align="center">

  <!-- Core Stack -->
  <img src="https://img.shields.io/badge/backend-NestJS-E0234E?logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/runtime-Node.js-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/language-TypeScript-3178C6?logo=typescript&logoColor=white" />

  <!-- Database -->
  <img src="https://img.shields.io/badge/database-PostgreSQL-4169E1?logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/orm-Prisma-2D3748?logo=prisma&logoColor=white" />

  <!-- Auth & Security -->
  <img src="https://img.shields.io/badge/auth-JWT-black?logo=jsonwebtokens" />
  <img src="https://img.shields.io/badge/security-bcrypt-blue?logo=security&logoColor=white" />
  <img src="https://img.shields.io/badge/validation-class--validator-3C873A" />

  <!-- API & Docs -->
  <img src="https://img.shields.io/badge/docs-Swagger-85EA2D?logo=swagger&logoColor=black" />
  <img src="https://img.shields.io/badge/api-REST-02569B" />

  <!-- Architecture -->
  <img src="https://img.shields.io/badge/architecture-modular-informational" />
  <img src="https://img.shields.io/badge/pattern-Clean%20Architecture-lightgrey" />

  <!-- Project Info (troca SEU_USUARIO) -->
  <img src="https://img.shields.io/github/languages/top/Sidere/devhub-api" />

</p>

API backend construída com NestJS, TypeScript, PostgreSQL e Prisma ORM,
utilizando autenticação baseada em JWT (Access + Refresh Token).

Este projeto segue uma arquitetura modular, com foco em escalabilidade,
organização e boas práticas de desenvolvimento backend.

------------------------------------------------------------------------

## 🧠 Stack Tecnológica

-   NestJS
-   TypeScript
-   PostgreSQL
-   Prisma ORM
-   JWT (Access Token + Refresh Token)
-   Passport
-   Swagger (OpenAPI)
-   class-validator / class-transformer
-   Bcrypt
-   Health Check (Terminus)

------------------------------------------------------------------------

## 📂 Arquitetura

A aplicação segue arquitetura modular padrão do NestJS:

src/ 
├── auth/ 
├── users/ 
├── logs/ 
├── health/ 
├── prisma/ 
├── common/
├── app.module.ts 
└── main.ts

------------------------------------------------------------------------

## 🔐 Auth Module (em desenvolvimento)

### Endpoints implementados

-   POST /api/auth/login
-   POST /api/auth/refresh
-   POST /api/auth/logout
-   GET /api/auth/me

### Implementações incluídas

-   JWT Strategy
-   Local Strategy
-   JwtAuthGuard
-   RolesGuard
-   Decorators personalizados (@Roles, @CurrentUser)
-   DTOs com validação automática

------------------------------------------------------------------------

## ⚙️ Configuração do Projeto

### 1️⃣ Clone o repositório

git clone https://github.com/SEU_USUARIO/devhub-api.git cd devhub-api

------------------------------------------------------------------------

### 2️⃣ Instale as dependências

npm install

------------------------------------------------------------------------

### 3️⃣ Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz:

DATABASE_URL= JWT_SECRET= JWT_EXPIRES_IN= JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN= PORT= ENVIRONMENT=

⚠️ O `.env` não deve ser versionado.

------------------------------------------------------------------------

### 4️⃣ Configure o banco

npx prisma migrate dev npx prisma generate

------------------------------------------------------------------------

### 5️⃣ Rodar seed inicial

npx prisma db seed

------------------------------------------------------------------------

## ▶️ Executando o projeto

npm run start:dev

API disponível em: http://localhost:3000/api

Swagger disponível em: http://localhost:3000/api/docs

------------------------------------------------------------------------

## 🔐 Autenticação

Fluxo de autenticação:

1.  Login com email + senha
2.  Retorna:
    -   accessToken (curta duração)
    -   refreshToken (longa duração)
3.  AccessToken usado no header:

Authorization: Bearer `<token>`{=html}

4.  RefreshToken usado para renovar o accessToken.

------------------------------------------------------------------------

## 🛡 Segurança

-   Senhas criptografadas com bcrypt
-   Validação global via ValidationPipe
-   Whitelist de DTOs ativada
-   Controle de roles baseado em enum do Prisma
-   Tokens com secrets separados (access / refresh)

------------------------------------------------------------------------

## 📊 Documentação

A documentação automática é gerada com Swagger e pode ser acessada em:

/api/docs

------------------------------------------------------------------------

## 🧪 Health Check

Monitoramento básico configurado via Terminus para:

-   Banco de dados
-   Serviços externos (configurável via env)

------------------------------------------------------------------------

## 📌 Status do Projeto

🚧 Em desenvolvimento\
✔ Setup inicial concluído\
✔ Prisma configurado\
✔ Estrutura base de autenticação criada\

------------------------------------------------------------------------

## 👩‍💻 Autor

Desenvolvido por Poliana Sidere\
Full Stack Developer focada em arquitetura limpa e APIs escaláveis.