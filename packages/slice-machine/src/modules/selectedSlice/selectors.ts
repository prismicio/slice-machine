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

  const libraries = getLibraries(store);
  const library = libraries?.find((l) => l.name.replace(/\//g, "--") === lib);
  const slice = library?.components.find((c) => c.model.name === sliceName);

  if (!slice || !library) return null;

  return getExtendedSlice({
    slice,
    mockConfig: SliceMockConfig.getSliceMockConfig(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
      store.environment.mockConfig,
      library.name,
      slice.model.name
    ),
    remoteSlice: store.slices.remoteSlices?.find(
      (e) => e.id === slice.model.id
    ),
  });
};
