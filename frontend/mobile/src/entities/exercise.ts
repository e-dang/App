import {createEntityAdapter} from "@reduxjs/toolkit";
import {Entity} from "./entity";

export interface Exercise extends Entity {
  name: string;
  createdAt: string;
  lastUpdatedAt: string;
}

export const exerciseAdapter = createEntityAdapter<Exercise>({
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});
