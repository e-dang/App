import {createEntityAdapter} from "@reduxjs/toolkit";
import {Entity} from "./entity";

export interface Workout extends Entity {
  name: string;
  createdAt: string;
  lastUpdatedAt: string;
}

export const workotAdapter = createEntityAdapter<Workout>({
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});
