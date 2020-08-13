FROM node:12.14-slim AS builder

RUN npm i -g lerna typescript

WORKDIR /app
COPY . /app

RUN lerna bootstrap --ci

FROM node:12.14-slim AS runner

WORKDIR /app
COPY --from=builder /app /app
