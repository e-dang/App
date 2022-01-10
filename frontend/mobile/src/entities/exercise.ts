import {Entity} from "./entity";

export interface ExerciseType extends Entity {
  name: string;
  createdAt: string;
  lastUpdatedAt: string;
}
