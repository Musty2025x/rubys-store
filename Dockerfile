
# ==========================================
# Stage 1: Base image
# ==========================================
FROM node:22-bookworm-slim AS base

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1


# ==========================================
# Stage 2: Application dependencies
# ==========================================
FROM base AS deps

COPY package.json package-lock.json ./

RUN npm ci


# ==========================================
# Stage 3: Build application
# ==========================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules

COPY . .

# Dummy database URLs used only during image building.
ENV DIRECT_URL="postgresql://build:build@localhost:5432/build"
ENV APP_DATABASE_URL="postgresql://build:build@localhost:5432/build"

RUN npx prisma generate

RUN npm run build


# ==========================================
# Stage 4: Install migration tools only
# ==========================================
FROM base AS prisma-tools

RUN npm install --prefix /opt/prisma-tools \
    --no-save \
    prisma@7.10.1 \
    dotenv@18.0.9


# ==========================================
# Stage 5: Lightweight Prisma migrator
# ==========================================
FROM base AS migrator

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=prisma-tools /opt/prisma-tools/node_modules ./node_modules

COPY prisma ./prisma

COPY prisma.config.ts ./prisma.config.ts

ENV PATH="/app/node_modules/.bin:${PATH}"

CMD ["prisma", "migrate", "deploy"]


# ==========================================
# Stage 6: Production application
# ==========================================
FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

USER node

COPY --from=builder --chown=node:node /app/public ./public

COPY --from=builder --chown=node:node /app/.next/standalone ./

COPY --from=builder --chown=node:node /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]