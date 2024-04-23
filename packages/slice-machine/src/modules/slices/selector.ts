import { SliceMachineStoreType } from "@/redux/type";

import { getLibraries } from "./index";

export const selectCurrentSlice = (
  store: SliceMachineStoreType,
  lib: string,
  sliceName: string,
) => {
  const library = getLibraries(store)?.find(
    (l) => l.name.replace(/\//g, "--") === lib,
  );
  const slice = library?.components.find((c) => c.model.name === sliceName);

  return slice;
};
