import { VariationSM } from "./Slice";
import { Component, Screenshot } from "./Library";
import { BackendEnvironment } from "./Environment";

export const createScreenshotUrl = (
  baseUrl: string,
  pathToScreenshot: string,
  hash: string
): string =>
  `${baseUrl}/api/__preview?q=${encodeURIComponent(
    pathToScreenshot
  )}&uniq=${hash}`;

export const createScreenshotUI = (
  baseUrl: string,
  screenshot: Screenshot
): ScreenshotUI => ({
  path: screenshot.path,
  hash: screenshot.hash,
  url: createScreenshotUrl(baseUrl, screenshot.path, screenshot.hash),
});

export const buildScreenshotUrls = (
  screenshots:
    | {
        [variationId: string]: Screenshot;
      }
    | undefined,
  baseUrl: string
): { [v: string]: ScreenshotUI } => {
  if (!screenshots) {
    return {};
  }
  return Object.entries(screenshots).reduce(
    (acc, [variationId, screenshot]) => {
      return screenshot.path
        ? {
            ...acc,
            [variationId]: {
              ...screenshot,
              ...createScreenshotUI(baseUrl, screenshot),
            },
          }
        : acc;
    },
    {}
  );
};

export interface ScreenshotUI extends Screenshot {
  url: string;
}

export interface ComponentUI extends Component {
  screenshots: Record<VariationSM["id"], ScreenshotUI>;
}

export const ComponentUI = {
  build(component: Component, env: BackendEnvironment): ComponentUI {
    return {
      ...component,
      screenshots: buildScreenshotUrls(component.screenshots, env.baseUrl),
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
