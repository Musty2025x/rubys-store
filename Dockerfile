# ==========================================
# Stage 1: Base image
# ==========================================
FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1


# ==========================================
# Stage 2: Install dependencies
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
# Never put real database credentials into the Docker image.
ENV DIRECT_URL="postgresql://build:build@localhost:5432/build"
ENV APP_DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN npx prisma generate
RUN npm run build


# ==========================================
# Stage 4: Production runtime
# ==========================================
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run the application as the non-root Node user.
USER node
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]