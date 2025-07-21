# Usa imagem base leve com Node 20
FROM node:20-slim

# Define diretório de trabalho
WORKDIR /app

# Instala git, python3, pip e limpa cache
RUN apt-get update && \
    apt-get install -y git python3 python3-pip && \
    pip3 install requests && \
    rm -rf /var/lib/apt/lists/*

# Copia ficheiros de dependências e instala
COPY package*.json ./
RUN npm install --omit=dev

# Copia o resto do projeto
COPY . .

# Cria diretórios necessários e ajusta permissões
RUN mkdir -p /app/data /app/temp && \
    chown -R node:node /app && \
    chmod -R 755 /app/temp

# Expõe a porta que será usada dinamicamente
EXPOSE 7860

# Comando para arrancar a app
CMD ["node", "index.js"]
