import { LocalOrRemoteSlice } from "@lib/models/common/ModelData";
import { SliceSM } from "@slicemachine/core/build/models";
import { LibraryUI } from "@models/common/LibraryUI";
import { ComponentUI } from "@lib/models/common/ComponentUI";

export const normalizeFrontendSlices = (
  localLibraries: ReadonlyArray<LibraryUI>,
  remoteSlices: ReadonlyArray<SliceSM>
): ReadonlyArray<LocalOrRemoteSlice> => {
  const slices: Record<string, LocalOrRemoteSlice> = {};

  const localComponents = localLibraries.reduce(
    (acc: ComponentUI[], library) => [...acc, ...library.components],
    []
  );

  localComponents.forEach((component) => {
    slices[component.model.id] = {
      local: component.model,
      localScreenshots: component.screenshots,
    };
  });

  remoteSlices.forEach((slice) => {
    slices[slice.id] = { remote: slice };
  });

  return Object.values(slices);
};
