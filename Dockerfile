FROM node:12.14 AS builder

RUN npm i -g lerna typescript

WORKDIR /app
COPY . /app

RUN lerna bootstrap --ci

FROM node:12.14-slim AS runner
RUN npm i -g lerna

WORKDIR /app
COPY --from=builder /app /app
