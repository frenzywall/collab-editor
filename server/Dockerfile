FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --production && npm prune --production
COPY . .

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./server.js
ENV NODE_ENV=production
USER node
EXPOSE 3001
CMD ["node", "server.js"]


# FROM node:20-alpine AS builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci --only=production
# COPY . .

# FROM node:20-alpine
# WORKDIR /app
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package*.json ./
# COPY --from=builder /app/server.js ./
# USER node
# ENV NODE_ENV=production
# EXPOSE 3001
# CMD ["node", "server.js"]