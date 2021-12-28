import "reflect-metadata";
import {config} from "@config";
import {createConnection} from "typeorm";
import {User} from "@entities";
import {app} from "@src/app";

createConnection({
  type: "postgres", // WHY MUST I HARDCODE STUPID ASS TYPESCRIPT
  host: config.dbHost,
  port: config.dbPort,
  username: config.dbUser,
  password: config.dbPassword,
  database: config.dbName,
  synchronize: true,
  logging: false,
  entities: [User],
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
})
  .then(() => {
    const server = app.listen(config.httpPort);

    console.log("Express server has started on port 3000");

    return server;
  })
  .catch((error) => console.log(error));
