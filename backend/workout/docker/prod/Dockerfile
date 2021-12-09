ARG NODE_VERSION=17.1-alpine

FROM node:${NODE_VERSION} as build

WORKDIR /app

COPY package.json .

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn compile

FROM node:${NODE_VERSION} as run

ENV NODE_ENV=production

ARG APP_HOME=/home/workouts/app

RUN addgroup --system --gid 150 workouts \
    && adduser --system --uid 150 --ingroup workouts workouts

USER workouts

WORKDIR ${APP_HOME}

RUN chown -R workouts:workouts ${APP_HOME}

COPY --chown=workouts:workouts package.json .

RUN yarn install --production --frozen-lockfile

COPY --from=build --chown=workouts:workouts /app/dist/src src
COPY --from=build --chown=workouts:workouts /app/dist/config config

CMD ["node", "src/index.js"]
