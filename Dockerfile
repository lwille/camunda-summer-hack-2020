FROM node:12.14-slim AS builder

COPY . .

RUN npm ci
