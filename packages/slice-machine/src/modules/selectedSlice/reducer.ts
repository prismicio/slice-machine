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
  pushSliceCreator,
  removeSliceWidgetCreator,
  reorderSliceWidgetCreator,
  replaceSliceWidgetCreator,
  saveSliceCreator,
  SelectedSliceActions,
  updateSliceWidgetMockCreator,
} from "./actions";
import { SelectedSliceStoreType } from "./types";
import * as Widgets from "../../../lib/models/common/widgets";
import SliceState from "@lib/models/ui/SliceState";
import { Variation } from "@lib/models/common/Variation";
import { SliceMockConfig } from "@lib/models/common/MockConfig";
import { LibStatus } from "@lib/models/common/ComponentUI";
import equal from "fast-deep-equal";
import { compareVariations } from "@lib/utils";

// Reducer
export const selectedSliceReducer: Reducer<
  SelectedSliceStoreType,
  SelectedSliceActions
> = (prevState = null, action) => {
  switch (action.type) {
    case getType(initSliceStoreCreator): {
      return {
        ...prevState,
        Model: updateTouchedAndStatus(action.payload.Model),
      };
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
          const newModel = SliceState.updateVariation(
            prevState.Model,
            variationId
          )((v) => Variation.addWidget(v, widgetsArea, key, value));
          return {
            ...prevState,
            Model: updateTouchedAndStatus(newModel),
          };
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
          const newModel = SliceState.updateVariation(
            prevState.Model,
            variationId
          )((v) =>
            Variation.replaceWidget(v, widgetsArea, previousKey, newKey, value)
          );

          return {
            ...prevState,
            Model: updateTouchedAndStatus(newModel),
          };
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

      const newModel = SliceState.updateVariation(
        prevState.Model,
        variationId
      )((v) => Variation.reorderWidget(v, widgetsArea, start, end));
      return {
        ...prevState,
        Model: updateTouchedAndStatus(newModel),
      };
    }
    case getType(removeSliceWidgetCreator): {
      if (!prevState) return prevState;
      const { variationId, widgetsArea, key } = action.payload;

      const newModel = SliceState.updateVariation(
        prevState.Model,
        variationId
      )((v) => Variation.deleteWidget(v, widgetsArea, key));
      return {
        ...prevState,
        Model: updateTouchedAndStatus(newModel),
      };
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

      const newModel = { ...prevState.Model, mockConfig: updatedConfig };

      return {
        ...prevState,
        Model: updateTouchedAndStatus(newModel),
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

      const newModel = { ...prevState.Model, mockConfig: updatedConfig };

      return {
        ...prevState,
        Model: updateTouchedAndStatus(newModel),
      };
    }
    case getType(generateSliceScreenshotCreator): {
      if (!prevState) return prevState;

      const newModel = {
        ...prevState.Model,
        screenshotUrls: action.payload.screenshots,
      };

      return {
        ...prevState,
        Model: updateTouchedAndStatus(newModel),
      };
    }
    case getType(generateSliceCustomScreenshotCreator): {
      if (!prevState) return prevState;
      const { variationId, screenshot } = action.payload;
      const { Model: prevModel } = prevState;

      const screenshots = prevModel.variations.reduce((acc, variation) => {
        if (variation.id === variationId) {
          return {
            ...acc,
            [variationId]: screenshot,
          };
        }
        if (prevModel.screenshotUrls?.[variation.id]) {
          return {
            ...acc,
            [variation.id]: prevModel.screenshotUrls[variation.id],
          };
        }
        return acc;
      }, {});

      const newModel = { ...prevModel, screenshotUrls: screenshots };

      return {
        ...prevState,
        Model: updateTouchedAndStatus(newModel),
      };
    }
    case getType(saveSliceCreator): {
      if (!prevState) return prevState;

      return {
        ...prevState,
        Model: updateTouchedAndStatus(action.payload.state),
      };
    }
    case getType(pushSliceCreator): {
      if (!prevState) return prevState;
      const newModel = {
        ...prevState.Model,
        __status: LibStatus.Synced,
        initialScreenshotUrls: prevState.Model.screenshotUrls,
        remoteVariations: prevState.Model.variations,
      };

      return { ...prevState, Model: updateTouchedAndStatus(newModel) };
    }
    case getType(copyVariationSliceCreator): {
      if (!prevState) return prevState;
      const { key, name, copied } = action.payload;
      const newVariation = Variation.copyValue(copied, key, name);
      const newModel = {
        ...prevState.Model,
        variations: prevState.Model.variations.concat([newVariation]),
      };
      return {
        ...prevState,
        Model: updateTouchedAndStatus(newModel),
        variation: newVariation,
      };
    }
    default:
      return prevState;
  }
};

const updateTouchedAndStatus = (model: SliceState) => {
  let status;

  const isTouched =
    !equal(model.initialVariations, model.variations) ||
    !equal(model.initialMockConfig, model.mockConfig);

  const isScreenshotModified = !equal(
    model.screenshotUrls,
    model.initialScreenshotUrls
  );

  // True if the remote and local slice variations don't match
  const isModelModified = !compareVariations(
    model.remoteVariations,
    model.initialVariations
  );

  if (model.__status !== LibStatus.NewSlice) {
    status = LibStatus.NewSlice;
  } else if (isModelModified || isScreenshotModified) {
    status = LibStatus.Modified;
  } else {
    status = model.__status;
  }

  return {
    ...model,
    isTouched: isTouched,
    __status: status,
  };
};
