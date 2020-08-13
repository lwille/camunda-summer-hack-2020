FROM node:12.14 AS builder

WORKDIR /app
COPY . .

RUN npm ci \
    lerna bootstrap

FROM node:12.14-slim AS runner

COPY --from=builder /app /app
CMD [ "examples/raffle" ]
