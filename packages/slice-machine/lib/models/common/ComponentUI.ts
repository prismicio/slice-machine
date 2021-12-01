import { Models } from "@slicemachine/models";
import { compareVariations } from "../../utils";
import Environment from "./Environment";

export const createScreenshotUrl = (
  baseUrl: string,
  pathToScreenshot: string
) =>
  `${baseUrl}/api/__preview?q=${encodeURIComponent(
    pathToScreenshot
  )}&uniq=${Math.random()}`;

export const createScreenshotUI = (
  baseUrl: string,
  pathToScreenshot: string
): ScreenshotUI => ({
  exists: true,
  path: pathToScreenshot,
  url: createScreenshotUrl(baseUrl, pathToScreenshot),
});

export const buildScreenshotUrls = (
  screenshotPaths:
    | {
        [variationId: string]: Models.Screenshot;
      }
    | undefined,
  baseUrl: string
) => {
  if (!screenshotPaths) {
    return {};
  }
  return Object.entries(screenshotPaths).reduce(
    (acc, [variationId, screenshot]) => {
      return screenshot.path
        ? {
            ...acc,
            [variationId]: createScreenshotUI(baseUrl, screenshot.path),
          }
        : acc;
    },
    {}
  );
};

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
    remoteSlices: ReadonlyArray<Models.SliceAsObject>,
    env: Environment
  ): ComponentUI {
    return {
      ...component,
      screenshotUrls: buildScreenshotUrls(
        component.infos.screenshotPaths,
        env.baseUrl
      ),
      __status: computeStatus(component, remoteSlices),
    };
  },
};

function computeStatus(
  component: Models.Component,
  remoteSlices: ReadonlyArray<Models.SliceAsObject>
): LibStatus {
  const previewMissing = Models.ComponentInfo.hasPreviewsMissing(
    component.infos
  );
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
