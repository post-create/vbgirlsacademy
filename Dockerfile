# VB Pige Akademi - Node.js server + Vite/React client (in /client)

# ---------- Stage 1: install and build ----------
FROM node:22-alpine AS builder
WORKDIR /app

# Install server and client dependencies (cached unless package files change)
COPY package.json package-lock.json* ./
COPY client/package.json client/package-lock.json* ./client/
RUN npm ci && npm ci --prefix client

# Copy the rest of the code and build the client (Vite -> client/dist)
COPY . .
RUN npm --prefix client run build

# Keep only production dependencies for the server
RUN npm prune --omit=dev && rm -rf client/node_modules

# ---------- Stage 2: the image that actually runs ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder --chown=node:node /app ./

USER node
EXPOSE 3000
CMD ["npm", "start"]
