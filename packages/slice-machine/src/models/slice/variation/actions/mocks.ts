import type { Models } from "@slicemachine/models";
import { SliceMockConfig } from "../../../../../lib/models/common/MockConfig";
import { ActionType } from "./ActionType";

export function updateWidgetMockConfig(
  dispatch: ({ type, payload }: { type: string; payload?: any }) => void
) {
  return (_variationId: string) => {
    return (
      sliceMockConfig: SliceMockConfig,
      widgetArea: Models.WidgetsArea,
      previousKey: string,
      fieldId: string,
      value: any
    ): any => {
      const updatedConfig = SliceMockConfig.updateFieldMockConfig(
        sliceMockConfig,
        _variationId,
        widgetArea,
        previousKey,
        fieldId,
        value
      );

      dispatch({
        type: ActionType.UpdateWidgetMockConfig,
        payload: updatedConfig,
      });
    };
  };
}

export function deleteWidgetMockConfig(
  dispatch: ({ type, payload }: { type: string; payload?: any }) => void
) {
  return (_variationId: string) => {
    return (
      sliceMockConfig: SliceMockConfig,
      widgetArea: Models.WidgetsArea,
      fieldId: string
    ): any => {
      if (!sliceMockConfig) return;

      const updatedConfig = SliceMockConfig.deleteFieldMockConfig(
        sliceMockConfig,
        _variationId,
        widgetArea,
        fieldId
      );

      dispatch({
        type: ActionType.DeleteWidgetMockConfig,
        payload: updatedConfig,
      });
    };
  };
}
