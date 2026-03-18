# Dockerfile
FROM node:22-alpine

# Instala dependências nativas necessárias
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instala dependências
RUN npm install

# Gera o Prisma Client
RUN npx prisma generate

# Copia o restante do código
COPY . .

# Expõe a porta da API
EXPOSE 4050

# Comando de desenvolvimento com hot-reload
CMD ["npm", "run", "start:dev"]