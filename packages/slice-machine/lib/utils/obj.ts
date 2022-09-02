import { cloneDeep, merge } from "lodash";

export const deepMerge = (obj1: object, obj2: object) => {
  return merge(cloneDeep(obj1), cloneDeep(obj2));
};
