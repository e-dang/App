import {TypedUseSelectorHook, useSelector as useReduxSelector, useDispatch as useReduxDispatch} from "react-redux";
import type {AppDispatch, RootState} from "@store";

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
export const useDispatch = () => useReduxDispatch<AppDispatch>();

export * from "./useSections";
export * from "./useSelectable";
