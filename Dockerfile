FROM node:20-alpine

WORKDIR /app

# Instala dependências primeiro para aproveitar o cache de camadas do Docker
COPY package*.json ./

RUN npm install

# Copia o restante do código fonte
COPY . .

EXPOSE 5173

# Inicia o Vite escutando em todas as interfaces de rede para acesso pelo host
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
