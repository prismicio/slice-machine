import type Models from "@slicemachine/core/build/src/models";
import { Variation } from "../../../lib/models/common/Variation";
import equal from "fast-deep-equal";
import SliceState from "../../../lib/models/ui/SliceState";

import { Field, FieldType } from "../../../lib/models/common/CustomType/fields";
import { sliceZoneType } from "../../../lib/models/common/CustomType/sliceZone";
import { AnyWidget } from "../../../lib/models/common/widgets/Widget";
import * as Widgets from "../../../lib/models/common/widgets";

import { ActionType as VariationActions } from "./variation/actions";

import { ActionType as SliceActions } from "./actions";

import {
  LibStatus,
  ScreenshotUI,
} from "../../../lib/models/common/ComponentUI";
import { compareVariations } from "../../../lib/utils";

export function reducer(
  prevState: SliceState,
  action: { type: string; payload?: unknown }
): SliceState {
  const result = ((): SliceState => {
    switch (action.type) {
      case SliceActions.Reset:
        return {
          ...prevState,
          variations: prevState.initialVariations,
        };
      case SliceActions.Save: {
        const { state } = action.payload as { state: SliceState };
        return state;
      }
      case SliceActions.Push:
        return {
          ...prevState,
          __status: LibStatus.Synced,
          initialScreenshotUrls: prevState.screenshotUrls,
          remoteVariations: prevState.variations,
        };
      case SliceActions.UpdateMetadata:
        return {
          ...prevState,
          infos: {
            ...prevState.infos,
            ...(action.payload as Models.ComponentMetadata),
          },
        };
      case SliceActions.CopyVariation: {
        const { key, name, copied } = action.payload as {
          key: string;
          name: string;
          copied: Models.VariationAsArray;
        };
        return {
          ...prevState,
          variations: prevState.variations.concat([
            Variation.copyValue<Models.VariationAsArray>(copied, key, name),
          ]),
        };
      }
      case VariationActions.GenerateCustomScreenShot: {
        const { variationId, screenshot } = action.payload as {
          variationId: string;
          screenshot: ScreenshotUI;
        };

        const screenshots = prevState.variations.reduce((acc, variation) => {
          if (variation.id === variationId) {
            return {
              ...acc,
              [variationId]: screenshot,
            };
          }
          if (prevState.screenshotUrls?.[variation.id]) {
            return {
              ...acc,
              [variation.id]: prevState.screenshotUrls?.[variation.id],
            };
          }
          return acc;
        }, {});

        return {
          ...prevState,
          screenshotUrls: screenshots,
        };
      }
      case VariationActions.GenerateScreenShot: {
        const { screenshots } = action.payload as {
          screenshots: Record<string, ScreenshotUI>;
        };
        return {
          ...prevState,
          screenshotUrls: screenshots,
        };
      }
      case VariationActions.AddWidget: {
        const { variationId, widgetsArea, key, value } = action.payload as {
          variationId: string;
          widgetsArea: Models.WidgetsArea;
          key: string;
          value: Field;
        };
        try {
          if (value.type !== sliceZoneType && value.type !== FieldType.Group) {
            const CurrentWidget: AnyWidget = Widgets[value.type];
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            CurrentWidget.schema.validateSync(value, { stripUnknown: false });
            return SliceState.updateVariation(
              prevState,
              variationId
            )((v) => Variation.addWidget(v, widgetsArea, key, value));
          }
          return prevState;
        } catch (err) {
          console.error(
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `[store/addWidget] Model is invalid for widget "${value.type}".\nFull error: ${err}`
          );
          return prevState;
        }
      }
      case VariationActions.ReplaceWidget: {
        const { variationId, widgetsArea, previousKey, newKey, value } =
          action.payload as {
            variationId: string;
            widgetsArea: Models.WidgetsArea;
            previousKey: string;
            newKey: string;
            value: Field;
          };
        try {
          if (value.type !== sliceZoneType && value.type !== FieldType.Group) {
            const CurrentWidget: AnyWidget = Widgets[value.type];
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            CurrentWidget.schema.validateSync(value, { stripUnknown: false });
            return SliceState.updateVariation(
              prevState,
              variationId
            )((v) =>
              Variation.replaceWidget(
                v,
                widgetsArea,
                previousKey,
                newKey,
                value
              )
            );
          }
          return prevState;
        } catch (err) {
          console.error(
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `[store/replaceWidget] Model is invalid for widget "${value.type}".\nFull error: ${err}`
          );
          return prevState;
        }
      }
      case VariationActions.ReorderWidget: {
        const { variationId, widgetsArea, start, end } = action.payload as {
          variationId: string;
          widgetsArea: Models.WidgetsArea;
          start: number;
          end: number;
        };
        return SliceState.updateVariation(
          prevState,
          variationId
        )((v) => Variation.reorderWidget(v, widgetsArea, start, end));
      }
      case VariationActions.RemoveWidget: {
        const { variationId, widgetsArea, key } = action.payload as {
          variationId: string;
          widgetsArea: Models.WidgetsArea;
          key: string;
        };
        return SliceState.updateVariation(
          prevState,
          variationId
        )((v) => Variation.deleteWidget(v, widgetsArea, key));
      }
      case VariationActions.UpdateWidgetMockConfig:
        return {
          ...prevState,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
          mockConfig: action.payload as any,
        };

      case VariationActions.DeleteWidgetMockConfig:
        return {
          ...prevState,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
          mockConfig: action.payload as any,
        };

      default:
        throw new Error("Invalid action.");
    }
  })();
  return {
    ...result,
    isTouched: (() => {
      // If the model is not pushed the model cannot be touched
      if (result.__status === LibStatus.NewSlice) {
        return false;
      }

      return (
        !equal(result.initialVariations, result.variations) ||
        !equal(result.initialMockConfig, result.mockConfig)
      );
    })(),
    __status: (() => {
      // If the model is not pushed the only status possible is new slice
      if (result.__status === LibStatus.NewSlice) {
        return result.__status;
      }

      const isScreenshotModified = !equal(
        result.screenshotUrls,
        result.initialScreenshotUrls
      );
      const isModelModified = !compareVariations(
        result.remoteVariations,
        result.initialVariations
      );

      return isScreenshotModified || isModelModified
        ? LibStatus.Modified
        : result.__status;
    })(),
  };
}
