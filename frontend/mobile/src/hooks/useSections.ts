import _ from "lodash";
import {useMemo} from "react";

interface Section<T> {
  title: string;
  data: T[];
}

type KeysOfType<T, K> = {[P in keyof T]: T[P] extends K ? P : never}[keyof T];

export const useAlphabeticalSections = <T>(flatData: T[] | undefined, groupingProp: KeysOfType<T, string>) => {
  return useMemo(
    () =>
      flatData
        ? _(flatData)
            // have to cast cause typescript is too dumb to infer value is a string...even though groupingProp can only refer to keys whose values are strings
            .filter((item: T) => (item[groupingProp] as unknown as string).length !== 0)
            .groupBy((item: T) => (item[groupingProp] as unknown as string)[0].toUpperCase())
            .map((data, title) => ({title, data} as Section<T>))
            .value()
        : [],
    [flatData, groupingProp],
  );
};
