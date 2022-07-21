import equal from "fast-deep-equal";
import { SliceMockConfig } from "@lib/models/common/MockConfig";
import { getExtendedSlice } from "@src/models/slice/context";
import { SliceMachineStoreType } from "@src/redux/type";
import { getLibraries } from "../slices";

export const selectCurrentSlice = (
  store: SliceMachineStoreType,
  lib: string,
  sliceName: string
) => {
  const openedModel = store.selectedSlice;
  if (openedModel?.component.model.name === sliceName) {
    return openedModel;
  }

  const library = getLibraries(store)?.find(
    (l) => l.name.replace(/\//g, "--") === lib
  );
  const slice = library?.components.find((c) => c.model.name === sliceName);

  if (!slice) return null;

  return getExtendedSlice({
    slice,
    mockConfig: SliceMockConfig.getSliceMockConfig(
      store.environment.mockConfig,
      slice.from,
      slice.model.name
    ),
  });
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

  const librarySliceMockConfig = SliceMockConfig.getSliceMockConfig(
    store.environment.mockConfig,
    librarySlice.from,
    librarySlice.model.name
  );

  const sameVariations = equal(
    librarySlice.model.variations,
    selectedSlice.component.model.variations
  );

  const sameMockConfig = equal(
    librarySliceMockConfig,
    selectedSlice.mockConfig
  );

  return !sameVariations || !sameMockConfig;
};
