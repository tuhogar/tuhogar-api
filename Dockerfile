FROM node:20-alpine

# Instalar dependências para compilar módulos nativos e ferramentas de rede
RUN apk update && apk add --no-cache \
    python3 \
    make \
    g++ \
    iputils \
    traceroute \
    mtr \
    && rm -rf /var/cache/apk/*

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências do projeto
RUN npm install

# Copiar o código-fonte da aplicação
COPY . .

# Expõe a porta da aplicação
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "start"]
