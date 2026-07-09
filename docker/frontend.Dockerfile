# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./

FROM base AS dependencies

RUN npm ci

FROM dependencies AS development

ENV NODE_ENV=development

COPY frontend ./

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM dependencies AS build

COPY frontend ./
RUN npm run build

FROM nginx:1.27-alpine AS production

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
