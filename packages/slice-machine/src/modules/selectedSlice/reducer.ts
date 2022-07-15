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
import { ExtendedComponentUI, SelectedSliceStoreType } from "./types";
import * as Widgets from "../../../lib/models/common/widgets";
import { Variation } from "@lib/models/common/Variation";
import { SliceMockConfig } from "@lib/models/common/MockConfig";
import {
  ComponentUI,
  LibStatus,
  ScreenshotUI,
} from "@lib/models/common/ComponentUI";
import equal from "fast-deep-equal";
import { compareVariations } from "@lib/utils";
import { SliceSM } from "@slicemachine/core/build/models";

// Reducer
export const selectedSliceReducer: Reducer<
  SelectedSliceStoreType,
  SelectedSliceActions
> = (prevState = null, action) => {
  switch (action.type) {
    case getType(initSliceStoreCreator): {
      return {
        ...prevState,
        component: action.payload.component,
        mockConfig: action.payload.mockConfig,
        initialMockConfig: action.payload.initialMockConfig,
        remoteVariations: action.payload.remoteVariations,
        initialVariations: action.payload.initialVariations,
        initialScreenshotUrls: action.payload.initialScreenshotUrls,
        isTouched: action.payload.isTouched,
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

          const component = ComponentUI.updateVariation(
            prevState.component,
            variationId
          )((v) => Variation.addWidget(v, widgetsArea, key, value));
          return updateTouched({ ...prevState, component });
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

          const component = ComponentUI.updateVariation(
            prevState.component,
            variationId
          )((v) =>
            Variation.replaceWidget(v, widgetsArea, previousKey, newKey, value)
          );
          return updateTouched({ ...prevState, component });
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

      const component = ComponentUI.updateVariation(
        prevState.component,
        variationId
      )((v) => Variation.reorderWidget(v, widgetsArea, start, end));
      return updateTouched({ ...prevState, component });
    }
    case getType(removeSliceWidgetCreator): {
      if (!prevState) return prevState;
      const { variationId, widgetsArea, key } = action.payload;

      const component = ComponentUI.updateVariation(
        prevState.component,
        variationId
      )((v) => Variation.deleteWidget(v, widgetsArea, key));
      return updateTouched({ ...prevState, component });
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

      return updateTouched({
        ...prevState,
        mockConfig: updatedConfig,
      });
    }
    case getType(deleteSliceWidgetMockCreator): {
      if (!prevState) return prevState;

      const updatedConfig = SliceMockConfig.deleteFieldMockConfig(
        action.payload.mockConfig,
        action.payload.variationId,
        action.payload.widgetArea,
        action.payload.newKey
      );
      return updateTouched({
        ...prevState,
        mockConfig: updatedConfig,
      });
    }
    case getType(generateSliceScreenshotCreator): {
      if (!prevState) return prevState;

      const component: ComponentUI = {
        ...prevState.component,
        screenshotUrls: action.payload.screenshots,
        __status: LibStatus.Modified,
      };

      return { ...prevState, component };
    }
    case getType(generateSliceCustomScreenshotCreator): {
      if (!prevState) return prevState;
      const { variationId, screenshot } = action.payload;
      const prevComponent = prevState.component;

      const screenshots: Record<string, ScreenshotUI> =
        prevComponent.model.variations.reduce((acc, variation) => {
          if (variation.id === variationId) {
            return {
              ...acc,
              [variationId]: screenshot,
            };
          }
          if (prevComponent.screenshotUrls?.[variation.id]) {
            return {
              ...acc,
              [variation.id]: prevComponent.screenshotUrls[variation.id],
            };
          }
          return acc;
        }, {});

      const component: ComponentUI = {
        ...prevState.component,
        screenshotUrls: screenshots,
        __status: LibStatus.Modified,
      };

      return { ...prevState, component };
    }
    case getType(saveSliceCreator): {
      if (!prevState) return prevState;
      const extendedComponent = action.payload.extendedComponent;
      return updateStatus({
        ...extendedComponent,
        initialMockConfig: extendedComponent.mockConfig,
        initialVariations: extendedComponent.component.model.variations,
        isTouched: false,
      });
    }
    case getType(pushSliceCreator): {
      if (!prevState) return prevState;

      const component: ComponentUI = {
        ...prevState.component,
        __status: LibStatus.Synced,
      };

      return {
        ...prevState,
        component,
        remoteVariations: component.model.variations,
        initialScreenshotUrls: component.screenshotUrls,
      };
    }
    case getType(copyVariationSliceCreator): {
      if (!prevState) return prevState;
      const { key, name, copied } = action.payload;
      const newVariation = Variation.copyValue(copied, key, name);

      const model: SliceSM = {
        ...prevState.component.model,
        variations: prevState.component.model.variations.concat([newVariation]),
      };
      return updateTouched({
        ...prevState,
        component: { ...prevState.component, model },
      });
    }
    default:
      return prevState;
  }
};

const updateTouched = (state: ExtendedComponentUI) => {
  const isTouched =
    !equal(state.initialVariations, state.component.model.variations) ||
    !equal(state.initialMockConfig, state.mockConfig);

  return { ...state, isTouched };
};

export function updateStatus(state: ExtendedComponentUI) {
  const __status = compareVariations(
    state.component.model.variations,
    state.remoteVariations
  )
    ? LibStatus.Synced
    : LibStatus.Modified;

  return { ...state, component: { ...state.component, __status } };
}
