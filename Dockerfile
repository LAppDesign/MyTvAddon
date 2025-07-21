FROM node:18-alpine

RUN apk add --no-cache git

WORKDIR /usr/src/app

# Não precisa mais do git clone aqui, pois o Railway copia o repo automaticamente
# Removendo: RUN git clone https://github.com/LAppDesign/MyTvAddon .

# Apenas copia os arquivos existentes no repo (que o Railway já clonou)
COPY . . 

RUN npm install --omit=dev

# --- NOSSA CORREÇÃO AQUI ---
# Criar a pasta 'temp' e dar permissões ao utilizador 'node'
RUN mkdir temp && chown node:node temp
# ---------------------------

EXPOSE 7860

# O Railway injeta a variável PORT. O seu aplicativo deve "escutar" nela.
# Ajuste o CMD para usar a variável PORT, se seu aplicativo precisa.
# Se o npm start já usa a variável PORT ou uma configuração do tipo, pode manter.
CMD ["npm", "start"]
