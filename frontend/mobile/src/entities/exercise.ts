import {Entity} from "./entity";

export interface Exercise extends Entity {
  name: string;
  createdAt: string;
  lastUpdatedAt: string;
}
