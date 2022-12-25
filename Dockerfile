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

# https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-on-alpine
RUN apk add --no-cache chromium
RUN addgroup -S pptruser && adduser -S -G pptruser pptruser
RUN mkdir -p /home/pptruser/Downloads /app
RUN chown -R pptruser:pptruser /home/pptruser
RUN chown -R pptruser:pptruser /app
USER pptruser

EXPOSE $PORT

ENV NODE_ENV=production

WORKDIR /app

# puppeteer plugin 패키기를 번들링할 수 없어서 선택한 대안책
COPY .yarnrc.yml package.json yarn.lock ./
COPY --from=builder /app/.yarn .yarn
COPY --from=builder /app/.pnp.cjs /app/.pnp.loader.mjs ./

COPY --from=builder /app/out out

ENTRYPOINT ["yarn", "start"]
