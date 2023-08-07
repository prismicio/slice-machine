import { AnyWidget } from "@lib/models/common/widgets/Widget";
import { Reducer } from "redux";
import { getType } from "typesafe-actions";
import {
  addSliceWidgetCreator,
  copyVariationSliceCreator,
  initSliceStoreCreator,
  removeSliceWidgetCreator,
  reorderSliceWidgetCreator,
  replaceSliceWidgetCreator,
  SelectedSliceActions,
  updateSelectedSliceMocks,
} from "./actions";
import { SelectedSliceStoreType } from "./types";
import * as Widgets from "../../../lib/models/common/widgets";
import { Variation } from "@lib/models/common/Variation";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { SliceSM } from "@lib/models/common/Slice";
import { renameSliceCreator } from "../slices";
import { refreshStateCreator } from "../environment";
import {
  generateSliceCustomScreenshotCreator,
  generateSliceScreenshotCreator,
} from "../screenshots/actions";

// Reducer
export const selectedSliceReducer: Reducer<
  SelectedSliceStoreType,
  SelectedSliceActions
> = (prevState = null, action) => {
  switch (action.type) {
    case getType(initSliceStoreCreator): {
      if (!action.payload) return null;
      return action.payload;
    }
    case getType(refreshStateCreator):
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (prevState === null || !action.payload.libraries) return prevState;

      const updatedSlice = action.payload.libraries
        .find((l) => l.name === prevState.from)
        ?.components.find((c) => c.model.id === prevState.model.id);

      if (updatedSlice === undefined) {
        return prevState;
      }
      return {
        ...prevState,
        screenshots: updatedSlice.screenshots,
      };
    case getType(addSliceWidgetCreator): {
      if (!prevState) return prevState;
      const { variationId, widgetsArea, key, value } = action.payload;
      try {
        if (
          value.type !== "Range" &&
          value.type !== "Separator" &&
          value.type !== "IntegrationFields"
        ) {
          const CurrentWidget: AnyWidget = Widgets[value.type];
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          CurrentWidget.schema.validateSync(value, { stripUnknown: false });

          return ComponentUI.updateVariation(
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
    case getType(replaceSliceWidgetCreator): {
      if (!prevState) return prevState;
      const { variationId, widgetsArea, previousKey, newKey, value } =
        action.payload;
      try {
        if (
          value.type !== "Range" &&
          value.type !== "Separator" &&
          value.type !== "IntegrationFields"
        ) {
          const CurrentWidget: AnyWidget = Widgets[value.type];
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          CurrentWidget.schema.validateSync(value, { stripUnknown: false });

          return ComponentUI.updateVariation(
            prevState,
            variationId
          )((v) =>
            Variation.replaceWidget(v, widgetsArea, previousKey, newKey, value)
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
    case getType(generateSliceScreenshotCreator.success):
    case getType(generateSliceCustomScreenshotCreator.success): {
      if (!prevState) return prevState;
      const { component, screenshot, variationId } = action.payload;
      return {
        ...component,
        screenshots: {
          ...component.screenshots,
          [variationId]: screenshot,
        },
      };
    }
    case getType(reorderSliceWidgetCreator): {
      if (!prevState) return prevState;
      const { variationId, widgetsArea, start, end } = action.payload;
      if (end === undefined) return prevState;

      return ComponentUI.updateVariation(
        prevState,
        variationId
      )((v) => Variation.reorderWidget(v, widgetsArea, start, end));
    }
    case getType(removeSliceWidgetCreator): {
      if (!prevState) return prevState;
      const { variationId, widgetsArea, key } = action.payload;

      return ComponentUI.updateVariation(
        prevState,
        variationId
      )((v) => Variation.deleteWidget(v, widgetsArea, key));
    }
    case getType(copyVariationSliceCreator): {
      if (!prevState) return prevState;
      const { key, name, copied } = action.payload;
      const newVariation = Variation.copyValue(copied, key, name);

      const model: SliceSM = {
        ...prevState.model,
        variations: prevState.model.variations.concat([newVariation]),
      };
      return {
        ...prevState,
        model,
      };
    }
    case getType(renameSliceCreator.success): {
      if (!prevState) return prevState;
      const { renamedSlice } = action.payload;

      return {
        ...prevState,
        model: renamedSlice,
      };
    }

    case getType(updateSelectedSliceMocks): {
      if (!prevState) return prevState;
      const { mocks } = action.payload;
      return {
        ...prevState,
        mocks,
      };
    }
    default:
      return prevState;
  }
};
