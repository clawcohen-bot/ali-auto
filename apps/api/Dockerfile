FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY nest-cli.json ./
COPY prisma ./prisma/

RUN npm install

RUN npx prisma generate

COPY src ./src/

RUN npm run build

# ---- Production stage ----
FROM node:20-alpine AS runner

WORKDIR /app

COPY package.json ./
COPY prisma ./prisma/

RUN npm install --omit=dev && npx prisma generate

COPY --from=builder /app/dist ./dist/

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
