import type Models from "@slicemachine/core/build/models";
import { SliceMockConfig } from "../../../../../lib/models/common/MockConfig";
import { ActionType } from "./ActionType";

export function updateWidgetMockConfig(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: ({ type, payload }: { type: string; payload?: any }) => void
) {
  return (_variationId: string) => {
    return (
      sliceMockConfig: SliceMockConfig,
      widgetArea: Models.WidgetsArea,
      previousKey: string,
      fieldId: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: ({ type, payload }: { type: string; payload?: any }) => void
) {
  return (_variationId: string) => {
    return (
      sliceMockConfig: SliceMockConfig,
      widgetArea: Models.WidgetsArea,
      fieldId: string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
