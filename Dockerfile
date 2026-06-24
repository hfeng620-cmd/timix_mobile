# =============================================================================
# Stage 1: Install all dependencies and build the Next.js app
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files and build
COPY . .
RUN npm run build

# =============================================================================
# Stage 2: Production image — only production deps and build output
# =============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy production dependencies
COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --production && npm cache clean --force

# Copy the Next.js build output and static assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

# Switch to the non-root user
USER nextjs

# Next.js listens on port 3000 by default
EXPOSE 3000

# Start the Next.js server
CMD ["node", "node_modules/.bin/next", "start", "-p", "3000"]
