import SliceState from "@lib/models/ui/SliceState";
import { SliceMachineStoreType } from "@src/redux/type";
import { getLibrariesState } from "../slices";

export const selectCurrentSlice = (
  store: SliceMachineStoreType,
  lib: string,
  sliceName: string
): SliceState | null => {
  const openedModel = store.selectedSlice?.Model;
  if (openedModel?.model.name === sliceName) {
    return openedModel;
  }

  const libraries = getLibrariesState(store);
  const library = libraries?.find(
    (library) => library.name.replace(/\//g, "--") === lib
  );
  const Model = library?.components.find(
    (component) => component.model.name === sliceName
  );

  if (Model) return Model;

  return null;
};
