# Install all packages and transpile TypeScript into JavaScript
FROM node:18 AS builder

ENV NODE_ENV=production

WORKDIR /app

COPY .yarn .yarn
COPY .yarnrc.yml package.json yarn.lock ./
RUN yarn

COPY esbuild.js tsconfig.json ./
COPY src src
RUN yarn build

# Copy bundle only
FROM node:18-alpine AS runner

EXPOSE $PORT

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/out out

ENTRYPOINT ["node", "out/index.cjs"]
