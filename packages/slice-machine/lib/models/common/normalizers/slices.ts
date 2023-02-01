import { LocalOrRemoteSlice } from "../ModelData";
import { Component, Library, SliceSM } from "@slicemachine/core/build/models";

export const normalizeFrontendSlices = (
  localLibraries: ReadonlyArray<Library<Component>>,
  remoteSlices: ReadonlyArray<SliceSM>
): LocalOrRemoteSlice[] => {
  const slices: Record<string, LocalOrRemoteSlice> = {};

  const localComponents = localLibraries.reduce<Component[]>(
    (acc, library) => [...acc, ...library.components],
    []
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
