FROM node:22-slim

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

# Install typescript + dev types for build step only
COPY tsconfig.json ./
COPY src/ src/
RUN npx -y typescript@5 tsc -p tsconfig.json

COPY public/ public/

ENV NODE_ENV=production
ENV PORT=4000
ENV DATA_DIR=/app/data

EXPOSE 4000

CMD ["node", "dist/server.js"]
