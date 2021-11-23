ARG NODE_VERSION=17.1

FROM node:${NODE_VERSION} as build

WORKDIR /app

COPY . .

RUN yarn install

CMD ["yarn", "dev"]
