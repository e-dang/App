ARG NODE_VERSION=17.1-alpine

FROM node:${NODE_VERSION} as build

WORKDIR /app

COPY package.json .

RUN yarn install

COPY . .

CMD ["yarn", "dev"]
