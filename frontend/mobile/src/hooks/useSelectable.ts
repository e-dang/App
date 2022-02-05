import {useEffect, useState} from "react";
import {Entity} from "@entities";
import _ from "lodash";

interface Selectable<T> {
  data: T;
  isSelected: boolean;
}

interface SelectableCache<T> {
  [x: string]: Selectable<T>;
}

const createSelectableCache = <T extends Entity>(data?: T[]) => {
  if (data === undefined) {
    return {};
  }

  return _.merge({}, ...data.map((item) => ({[item.id]: {data: item, isSelected: false}}))) as SelectableCache<T>;
};

export const useSelectable = <T extends Entity>(unselectableData?: T[]) => {
  const [selections, setSelections] = useState<SelectableCache<T>>(() => createSelectableCache(unselectableData));

  useEffect(() => {
    setSelections(createSelectableCache(unselectableData));
  }, [setSelections, unselectableData]);

  const select = (item: T) => {
    setSelections({...selections, [item.id]: {data: item, isSelected: !selections[item.id].isSelected}});
  };

  const isSelected = (item: T) => {
    return !!selections[item.id]?.isSelected;
  };

  const getSelected = () => {
    return Object.values(selections)
      .filter((item) => item.isSelected)
      .map(({data}) => data);
  };

  return {selections, select, isSelected, getSelected};
};
