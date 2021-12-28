import express, {Request, Response} from "express";
import {ApiGroup, apis} from "@api";
import {config} from "@config";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import {errorHandler} from "./middleware";

function createApiPath(api: ApiGroup) {
  const path = `/api/${config.apiVersion}`;
  if (api.pathPrefix) {
    return `${path}/${api.pathPrefix}`;
  }
  return path;
}

// intialize components
export const app = express();

// middleware
app.use(express.json());
app.use(cors({origin: config.allowedHosts}));
app.use(cookieParser());
if (config.env !== "test" && config.env !== "ci") {
  app.use(morgan("combined"));
}

// add apis
apis.forEach((api) => {
  app.use(createApiPath(api), api.router);
});

// error handlers
app.use(errorHandler);

app.get("/health", (req: Request, res: Response) => {
  return res.status(200).json();
});
