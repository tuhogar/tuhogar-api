# Etapa de construção
FROM node:20 as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa de produção
FROM node:20

ENV MONGODB_URL=mongodb+srv://tuhogar-db:ENsZWHRXKn05paIL@cluster0.cg0fztr.mongodb.net/tuhogar?retryWrites=true&w=majority&appName=Cluster0

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/main"]
