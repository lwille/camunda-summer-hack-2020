FROM node:12.14 AS builder

RUN npm i -g lerna typescript

WORKDIR /app
COPY . /app

RUN lerna bootstrap

FROM node:12.14-slim AS runner

COPY --from=builder /app /app
CMD [ "examples/raffle" ]
