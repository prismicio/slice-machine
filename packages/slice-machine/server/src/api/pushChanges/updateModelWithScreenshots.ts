import type { SliceSM } from "@slicemachine/core/build/models/Slice";
import type { Component, Library } from "@slicemachine/core/build/models";
import { BackendEnvironment } from "../../../../lib/models/common/Environment";
import { uploadScreenshots as uploadScreenshotsClient } from "../services/sliceService";

/* UPLOAD SLICE SCREENSHOTS AND UPDATE THE MODAL */
export async function updateModelWithScreenshots(
  env: BackendEnvironment,
  slice: SliceSM,
  localLibraries: ReadonlyArray<Library<Component>>
) {
  const libraryName =
    localLibraries.find((library) =>
      library.components.some((component) => component.model.id === slice.id)
    )?.name ?? "";
  const screenshotUrlsByVariation = await uploadScreenshotsClient(
    env,
    slice,
    slice.name,
    libraryName
  );
  return {
    ...slice,
    variations: slice.variations.map((localVariation) => ({
      ...localVariation,
      imageUrl:
        screenshotUrlsByVariation[localVariation.id] ?? localVariation.imageUrl,
    })),
  };
}
