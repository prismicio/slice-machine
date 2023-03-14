import { LocalOrRemoteSlice } from "../ModelData";
import { SliceSM } from "@lib/models/common/Slice";
import { Library, Component } from "@lib/models/common/Library";

export const normalizeFrontendSlices = (
  localLibraries: ReadonlyArray<Library<Component>>,
  remoteSlices: ReadonlyArray<SliceSM>
): LocalOrRemoteSlice[] => {
  const slices: Record<string, LocalOrRemoteSlice> = {};

  const localComponents = localLibraries.flatMap(
    (library) => library.components
  );

  localComponents.forEach((component) => {
    slices[component.model.id] = {
      local: component.model,
      localScreenshots: component.screenshots,
    };
  });

  remoteSlices.forEach((slice) => {
    slices[slice.id] = { ...slices[slice.id], remote: slice };
  });

  return Object.values(slices);
};
