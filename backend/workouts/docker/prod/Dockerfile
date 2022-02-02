ARG NODE_VERSION=17.1-alpine

FROM node:${NODE_VERSION} as build
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn compile

FROM node:${NODE_VERSION} as run
ENV NODE_ENV=production
RUN apk update && apk upgrade && apk add --no-cache dumb-init
USER node
WORKDIR /home/node/app
COPY --chown=node:node package.json .
COPY --chown=node:node yarn.lock .
RUN yarn install --production --frozen-lockfile
COPY --from=build --chown=node:node /app/dist .
CMD ["dumb-init", "node", "src/main"]
