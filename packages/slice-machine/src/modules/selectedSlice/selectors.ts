import { SliceMachineStoreType } from "@src/redux/type";
import { getLibrariesState } from "../slices";
import { ExtendedComponentUI } from "./types";

export const selectCurrentSlice = (
  store: SliceMachineStoreType,
  lib: string,
  sliceName: string
): ExtendedComponentUI | null => {
  const openedModel = store.selectedSlice;
  if (openedModel?.component.model.name === sliceName) {
    return openedModel;
  }

  const libraries = getLibrariesState(store);
  const library = libraries?.find(
    (library) => library.name.replace(/\//g, "--") === lib
  );
  const extendedComponent = library?.components.find(
    (component) => component.component.model.name === sliceName
  );

  return extendedComponent || null;
};
