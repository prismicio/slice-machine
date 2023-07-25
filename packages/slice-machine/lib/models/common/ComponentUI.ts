import { VariationSM } from "./Slice";
import { Component, Screenshot } from "./Library";

export const createScreenshotUI = (screenshot: Screenshot): ScreenshotUI => ({
  hash: screenshot.hash,
});

export const buildScreenshotUrls = (
  screenshots:
    | {
        [variationId: string]: Screenshot;
      }
    | undefined
): { [v: string]: ScreenshotUI } => {
  if (!screenshots) {
    return {};
  }
  return Object.entries(screenshots).reduce(
    (acc, [variationId, screenshot]) => {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      return screenshot.hash
        ? {
            ...acc,
            [variationId]: {
              ...screenshot,
              ...createScreenshotUI(screenshot),
            },
          }
        : acc;
    },
    {}
  );
};

export interface ScreenshotUI extends Screenshot {
  url?: string;
}

export interface ComponentUI extends Component {
  screenshots: Record<VariationSM["id"], ScreenshotUI>;
}

export const ComponentUI = {
  build(component: Component): ComponentUI {
    return {
      ...component,
      screenshots: buildScreenshotUrls(component.screenshots),
    };
  },
  variation(
    component: ComponentUI,
    variationId?: string
  ): VariationSM | undefined {
    if (component.model.variations.length) {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
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
