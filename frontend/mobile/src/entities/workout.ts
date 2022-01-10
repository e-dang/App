import {Entity} from "./entity";

export interface WorkoutTemplate extends Entity {
  name: string;
  createdAt: string;
  lastUpdatedAt: string;
}
