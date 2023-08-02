import equal from "fast-deep-equal";
import { SliceMachineStoreType } from "@src/redux/type";
import { getLibraries } from "../slices";

export const selectSliceById = (
  store: SliceMachineStoreType,
  libraryName: string,
  sliceId: string
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
  sliceName: string
) => {
  const openedModel = store.selectedSlice;
  if (openedModel?.model.name === sliceName) {
    return openedModel;
  }

  const library = getLibraries(store)?.find(
    (l) => l.name.replace(/\//g, "--") === lib
  );
  const slice = library?.components.find((c) => c.model.name === sliceName);

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  return slice || null;
};

export const isSelectedSliceTouched = (
  store: SliceMachineStoreType,
  lib: string,
  sliceId: string
): boolean => {
  const selectedSlice = store.selectedSlice;
  const library = getLibraries(store)?.find((l) => l.name === lib);
  const librarySlice = library?.components.find((c) => c.model.id === sliceId);

  if (!selectedSlice || !librarySlice) return false;

  const sameVariations = equal(
    librarySlice.model.variations,
    selectedSlice.model.variations
  );

  return !sameVariations;
};
