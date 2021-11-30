import type { Models } from "@slicemachine/core";
import { ComponentInfo } from "@slicemachine/core/build/src/models/Library";
import { compareVariations } from "../../utils";

export enum LibStatus {
  Modified = "MODIFIED",
  Synced = "SYNCED",
  PreviewMissing = "PREVIEW_MISSING",
  Invalid = "INVALID",
  NewSlice = "NEW_SLICE",
}

export interface ScreenshotUI extends Models.Screenshot {
  url: string;
}

export interface ComponentUI extends Models.Component {
  __status: LibStatus;
  screenshotUrls?: Record<Models.VariationAsObject["id"], ScreenshotUI>;
}

export const ComponentUI = {
  build(
    component: Models.Component,
    remoteSlices: ReadonlyArray<Models.SliceAsObject>
  ): ComponentUI {
    return {
      ...component,
      screenshotUrls: {},
      __status: computeStatus(component, remoteSlices),
    };
  },
};

function computeStatus(
  component: Models.Component,
  remoteSlices: ReadonlyArray<Models.SliceAsObject>
): LibStatus {
  const previewMissing = ComponentInfo.hasPreviewsMissing(component.infos);
  if (previewMissing) return LibStatus.PreviewMissing;

  const slice = remoteSlices.find((s) => component.model.id === s.id);
  if (!slice) return LibStatus.NewSlice;

  const sameVersion = !compareVariations(
    component.model.variations,
    slice.variations
  );

  if (sameVersion) return LibStatus.Synced;
  else return LibStatus.Modified;
}
