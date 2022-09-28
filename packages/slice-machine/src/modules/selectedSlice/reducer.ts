import { AnyWidget } from "@lib/models/common/widgets/Widget";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";
import { Reducer } from "redux";
import { getType } from "typesafe-actions";
import {
  addSliceWidgetCreator,
  copyVariationSliceCreator,
  deleteSliceWidgetMockCreator,
  generateSliceCustomScreenshotCreator,
  generateSliceScreenshotCreator,
  initSliceStoreCreator,
  removeSliceWidgetCreator,
  reorderSliceWidgetCreator,
  replaceSliceWidgetCreator,
  SelectedSliceActions,
  updateSliceWidgetMockCreator,
} from "./actions";
import { SelectedSliceStoreType } from "./types";
import * as Widgets from "../../../lib/models/common/widgets";
import { Variation } from "@lib/models/common/Variation";
import { SliceMockConfig } from "@lib/models/common/MockConfig";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { SliceSM } from "@slicemachine/core/build/models";
import { renamedComponentUI, renameSliceCreator } from "../slices";

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
    case getType(addSliceWidgetCreator): {
      if (!prevState) return prevState;
      const { variationId, widgetsArea, key, value } = action.payload;
      try {
        if (
          value.type !== WidgetTypes.Range &&
          value.type !== WidgetTypes.Separator &&
          value.type !== WidgetTypes.IntegrationField
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
          value.type !== WidgetTypes.Range &&
          value.type !== WidgetTypes.Separator &&
          value.type !== WidgetTypes.IntegrationField
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
    case getType(updateSliceWidgetMockCreator): {
      if (!prevState) return prevState;

      const updatedConfig = SliceMockConfig.updateFieldMockConfig(
        action.payload.mockConfig,
        action.payload.variationId,
        action.payload.widgetArea,
        action.payload.previousKey,
        action.payload.newKey,
        action.payload.mockValue
      );

      return {
        ...prevState,
        mockConfig: updatedConfig,
      };
    }
    case getType(deleteSliceWidgetMockCreator): {
      if (!prevState) return prevState;

      const updatedConfig = SliceMockConfig.deleteFieldMockConfig(
        action.payload.mockConfig,
        action.payload.variationId,
        action.payload.widgetArea,
        action.payload.newKey
      );
      return {
        ...prevState,
        mockConfig: updatedConfig,
      };
    }
    case getType(generateSliceScreenshotCreator.success):
    case getType(generateSliceCustomScreenshotCreator.success): {
      if (!prevState) return prevState;
      return {
        ...action.payload.component,
      };
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
      const { newSliceName } = action.payload;
      return renamedComponentUI(prevState, newSliceName);
    }
    default:
      return prevState;
  }
};
