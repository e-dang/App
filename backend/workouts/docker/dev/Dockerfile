ARG NODE_VERSION=17.1-alpine

FROM node:${NODE_VERSION} as build
ENV NODE_ENV=development
WORKDIR /home/node/app
COPY package.json .
COPY yarn.lock .
RUN yarn install --frozen-lockfile
COPY . .
CMD ["yarn", "start"]
