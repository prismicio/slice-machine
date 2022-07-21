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
import { compareVariations } from "@lib/utils";
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
      return {
        ...prevState,
        component: action.payload.component,
        mockConfig: action.payload.mockConfig,
        remoteVariations: action.payload.remoteVariations,
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
          return { ...prevState, component };
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
          return { ...prevState, component };
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
      return { ...prevState, component };
    }
    case getType(removeSliceWidgetCreator): {
      if (!prevState) return prevState;
      const { variationId, widgetsArea, key } = action.payload;

      const component = ComponentUI.updateVariation(
        prevState.component,
        variationId
      )((v) => Variation.deleteWidget(v, widgetsArea, key));
      return { ...prevState, component };
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
    case getType(generateSliceScreenshotCreator.success): {
      if (!prevState) return prevState;

      const component: ComponentUI = {
        ...prevState.component,
        screenshotUrls: action.payload.screenshots,
        __status: LibStatus.Modified,
      };

      return { ...prevState, component };
    }
    case getType(generateSliceCustomScreenshotCreator.success): {
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
    case getType(saveSliceCreator.success): {
      if (!prevState) return prevState;
      const extendedComponent = action.payload.extendedComponent;

      const sameVariations = compareVariations(
        extendedComponent.component.model.variations,
        extendedComponent.remoteVariations
      );

      return {
        ...extendedComponent,
        component: {
          ...extendedComponent.component,
          __status: sameVariations ? LibStatus.Synced : LibStatus.Modified,
        },
      };
    }
    case getType(pushSliceCreator.success): {
      if (!prevState) return prevState;

      const component: ComponentUI = {
        ...prevState.component,
        __status: LibStatus.Synced,
      };

      return {
        ...prevState,
        component,
        remoteVariations: component.model.variations,
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
      return {
        ...prevState,
        component: { ...prevState.component, model },
      };
    }
    case getType(renameSliceCreator.success): {
      if (!prevState) return prevState;
      const { newSliceName } = action.payload;
      return renamedExtendedComponent(prevState, newSliceName);
    }
    default:
      return prevState;
  }
};

export function updateStatus(state: NonNullable<SelectedSliceStoreType>) {
  const __status = compareVariations(
    state.component.model.variations,
    state.remoteVariations
  )
    ? LibStatus.Synced
    : LibStatus.Modified;

  return { ...state, component: { ...state.component, __status } };
}

const renamedExtendedComponent = (
  initialState: ExtendedComponentUI,
  newName: string
): ExtendedComponentUI => {
  const newComponentUI = renamedComponentUI(initialState.component, newName);

  return {
    ...initialState,
    component: newComponentUI,
  };
};
