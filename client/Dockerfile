FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN mkdir -p /app/monitoring
COPY prometheus.yml rules.yml datasource.yml /app/monitoring/

ENV NODE_ENV=production
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build/ /usr/share/nginx/html/
COPY --from=builder /app/monitoring/ /app/monitoring/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


# FROM node:20-alpine AS builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci --only=production
# COPY . .
# ENV NODE_ENV=production
# RUN npm run build

# FROM nginx:alpine
# COPY --from=builder /app/build /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]