import {Entity} from "./entity";

export interface Workout extends Entity {
  name: string;
  createdAt: string;
  lastUpdatedAt: string;
}
