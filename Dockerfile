# ===========================================
# ZENLAND INTERFACE - MULTI-STAGE DOCKERFILE
# ===========================================
#
# Optimized for production with standalone output.
# Final image is minimal (~100MB) using Alpine.
#
# Build args (set in docker-compose or CI):
#   - NEXT_PUBLIC_API_URL
#   - NEXT_PUBLIC_PDF_URL
#   - NEXT_PUBLIC_COMMIT_HASH
#
# Usage:
#   docker build -t zenland-interface .
#   docker run -p 3000:3000 zenland-interface
#

# ===========================================
# Stage 1: Dependencies
# ===========================================
FROM node:20-alpine AS deps

# Add libc6-compat for Alpine compatibility
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --ignore-scripts

# ===========================================
# Stage 2: Builder
# ===========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_PDF_URL
ARG NEXT_PUBLIC_COMMIT_HASH

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_PDF_URL=$NEXT_PUBLIC_PDF_URL
ENV NEXT_PUBLIC_COMMIT_HASH=$NEXT_PUBLIC_COMMIT_HASH

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Increase Node.js heap memory for build (helps on low-memory servers)
ENV NODE_OPTIONS="--max-old-space-size=3072"

# Build the application
RUN npm run build
# ===========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
# Next.js standalone output includes everything needed
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set hostname for container
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Start the application
CMD ["node", "server.js"]
