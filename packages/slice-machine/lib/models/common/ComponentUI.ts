import {
  SliceSM,
  VariationSM,
  Screenshot,
  Component,
} from "@slicemachine/core/build/models";
import { compareVariations } from "../../utils";
import { BackendEnvironment } from "./Environment";
import { CustomTypeMockConfig, SliceMockConfig } from "./MockConfig";

export const createScreenshotUrl = (
  baseUrl: string,
  pathToScreenshot: string
): string =>
  `${baseUrl}/api/__preview?q=${encodeURIComponent(
    pathToScreenshot
  )}&uniq=${Math.random()}`;

export const createScreenshotUI = (
  baseUrl: string,
  pathToScreenshot: string
): ScreenshotUI => ({
  path: pathToScreenshot,
  url: createScreenshotUrl(baseUrl, pathToScreenshot),
});

export const buildScreenshotUrls = (
  screenshotPaths:
    | {
        [variationId: string]: Screenshot;
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
  Invalid = "INVALID",
  NewSlice = "NEW_SLICE",
}

export interface ScreenshotUI extends Screenshot {
  url: string;
}

export interface ComponentUI extends Component {
  __status: LibStatus;
  screenshotUrls?: Record<VariationSM["id"], ScreenshotUI>;
  mockConfig: CustomTypeMockConfig;
}

export const ComponentUI = {
  build(
    component: Component,
    remoteSlices: ReadonlyArray<SliceSM>,
    env: BackendEnvironment
  ): ComponentUI {
    return {
      ...component,
      screenshotUrls: buildScreenshotUrls(
        component.screenshotPaths,
        env.baseUrl
      ),
      __status: computeStatus(component, remoteSlices),
      mockConfig: SliceMockConfig.getSliceMockConfig(
        env.mockConfig,
        component.from,
        component.model.name
      ),
    };
  },
  variation(
    component: ComponentUI,
    variationId?: string
  ): VariationSM | undefined {
    if (component.model.variations.length) {
      if (variationId)
        return component.model.variations.find((v) => v.id === variationId);
      return component.model.variations[0];
    }
  },

  updateVariation(component: ComponentUI, variationId: string) {
    return (mutateCallbackFn: (v: VariationSM) => VariationSM): ComponentUI => {
      const variations = component.model.variations.map((v) => {
        if (v.id === variationId) return mutateCallbackFn(v);
        else return v;
      });

      return {
        ...component,
        model: { ...component.model, variations },
      };
    };
  },
};

export function computeStatus(
  component: Component,
  remoteSlices: ReadonlyArray<SliceSM>
): LibStatus {
  const slice = remoteSlices.find((s) => component.model.id === s.id);
  if (!slice) return LibStatus.NewSlice;

  const sameVersion = compareVariations(
    component.model.variations,
    slice.variations
  );

  const sameName = component.model.name === slice.name;

  if (sameVersion && sameName) return LibStatus.Synced;
  else return LibStatus.Modified;
}
