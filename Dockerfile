FROM node:22-alpine AS build
WORKDIR /app
# Baked into the client bundle at build time (Vite exposes VITE_-prefixed env vars via
# import.meta.env) so the running app can show what's actually deployed — see the
# "Settings > About" footer. Defaults to "dev" for local/uncommitted builds.
ARG APP_VERSION=dev
ENV VITE_APP_VERSION=$APP_VERSION
COPY package.json package-lock.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
RUN npm ci
COPY client client
COPY server server
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
RUN npm ci --omit=dev
COPY --from=build /app/client/dist client/dist
COPY --from=build /app/server/dist server/dist

EXPOSE 44000
CMD ["node", "server/dist/index.js"]
