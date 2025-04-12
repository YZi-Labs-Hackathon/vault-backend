FROM node:20.18.3-alpine as builder
WORKDIR /app
COPY . .
RUN yarn
RUN yarn build

FROM node:20.18.3-alpine
ENV NODE_ENV=production

RUN npm install -g pm2
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --production --pure-lockfile

COPY --from=builder /app/dist ./dist
COPY ./ecosystem.config.js ./
EXPOSE 3000
CMD ["pm2-runtime", "start", "ecosystem.config.js"]