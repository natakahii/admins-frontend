FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_API_BASE_URL=https://api.natakahii.com
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY package.json package-lock.json ./
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set fetch-timeout 600000 \
    && npm config set strict-ssl false \
    && npm config set registry http://registry.npmjs.org/ \
    && for attempt in 1 2 3; do \
        npm install --no-audit --no-fund --legacy-peer-deps && exit 0; \
        sleep 5; \
      done; \
    exit 1

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
