import { CustomTypeMockConfig } from "@lib/models/common/MockConfig";
import Actions from "./";

export function updateWidgetGroupMockConfig(
  dispatch: ({ type, payload }: { type: string; payload?: any }) => void
) {
  return (
    customTypeMockConfig: CustomTypeMockConfig,
    groupId: string,
    previousFieldId: string,
    fieldId: string,
    value: any
  ): void => {
    const updatedConfig = CustomTypeMockConfig.updateGroupFieldMockConfig(
      customTypeMockConfig,
      groupId,
      previousFieldId,
      fieldId,
      value
    );
    // you can use same dispatch her
    dispatch({ type: Actions.UpdateWidgetMockConfig, payload: updatedConfig });
  };
}
export function updateWidgetMockConfig(
  dispatch: ({ type, payload }: { type: string; payload?: any }) => void
) {
  return (
    customTypeMockConfig: CustomTypeMockConfig,
    previousFieldId: string,
    fieldId: string,
    value: any
  ): void => {
    if (!customTypeMockConfig) return;
    const updatedConfig = CustomTypeMockConfig.updateFieldMockConfig(
      customTypeMockConfig,
      previousFieldId,
      fieldId,
      value
    );
    dispatch({ type: Actions.UpdateWidgetMockConfig, payload: updatedConfig });
  };
}

export function deleteWidgetGroupMockConfig(
  dispatch: ({ type, payload }: { type: string; payload?: any }) => void
) {
  return (
    customTypeMockConfig: CustomTypeMockConfig,
    groupId: string,
    fieldId: string
  ): void => {
    if (!customTypeMockConfig) return;

    const updatedConfig = CustomTypeMockConfig.deleteGroupFieldMockConfig(
      customTypeMockConfig,
      groupId,
      fieldId
    );

    dispatch({ type: Actions.DeleteWidgetMockConfig, payload: updatedConfig });
  };
}

export function deleteWidgetMockConfig(
  dispatch: ({ type, payload }: { type: string; payload?: any }) => void
) {
  return (
    customTypeMockConfig: CustomTypeMockConfig,
    fieldId: string
  ): void => {
    if (!customTypeMockConfig) return;

    const updatedConfig = CustomTypeMockConfig.deleteFieldMockConfig(
      customTypeMockConfig,
      fieldId
    );

    dispatch({ type: Actions.DeleteWidgetMockConfig, payload: updatedConfig });
  };
}
