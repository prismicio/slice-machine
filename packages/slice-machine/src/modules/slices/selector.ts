import { SliceMachineStoreType } from "@src/redux/type";

import { getLibraries } from "./index";

export const selectSliceById = (
  store: SliceMachineStoreType,
  libraryName: string,
  sliceId: string,
) => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const libraries = getLibraries(store) || [];

  const library = libraries.find((library) => library.name === libraryName);
  const slice = library?.components.find((c) => c.model.id === sliceId);

  return slice;
};

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
