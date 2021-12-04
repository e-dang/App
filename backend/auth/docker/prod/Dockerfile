ARG NODE_VERSION=17.1-alpine

FROM node:${NODE_VERSION} as build

WORKDIR /app

COPY package.json .

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn compile

FROM node:${NODE_VERSION} as run

ENV NODE_ENV=production

ARG APP_HOME=/home/auth/app

RUN addgroup --system --gid 150 auth \
    && adduser --system --uid 150 --ingroup auth auth

USER auth

WORKDIR ${APP_HOME}

RUN chown -R auth:auth ${APP_HOME}

COPY --chown=auth:auth package.json .

RUN yarn install --production --frozen-lockfile

COPY --from=build --chown=auth:auth /app/dist/src src
COPY --from=build --chown=auth:auth /app/dist/config config

CMD ["node", "src/index.js"]
