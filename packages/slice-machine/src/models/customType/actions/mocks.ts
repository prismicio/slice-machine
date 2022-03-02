import { CustomTypeMockConfig } from "@lib/models/common/MockConfig";
import {
  CustomTypeActions,
  deleteFieldMockConfigCreator,
  updateFieldMockConfigCreator,
} from "@src/models/customType/newActions";
import { Dispatch } from "react";

export function updateWidgetGroupMockConfig(
  dispatch: Dispatch<CustomTypeActions>
) {
  return (
    customTypeMockConfig: CustomTypeMockConfig,
    groupId: string,
    previousFieldId: string,
    fieldId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    dispatch(updateFieldMockConfigCreator({ mockConfig: updatedConfig }));
  };
}
export function updateWidgetMockConfig(dispatch: Dispatch<CustomTypeActions>) {
  return (
    customTypeMockConfig: CustomTypeMockConfig,
    previousFieldId: string,
    fieldId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ): void => {
    if (!customTypeMockConfig) return;
    const updatedConfig = CustomTypeMockConfig.updateFieldMockConfig(
      customTypeMockConfig,
      previousFieldId,
      fieldId,
      value
    );
    dispatch(updateFieldMockConfigCreator({ mockConfig: updatedConfig }));
  };
}

export function deleteWidgetGroupMockConfig(
  dispatch: Dispatch<CustomTypeActions>
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

    dispatch(deleteFieldMockConfigCreator({ mockConfig: updatedConfig }));
  };
}

export function deleteWidgetMockConfig(dispatch: Dispatch<CustomTypeActions>) {
  return (
    customTypeMockConfig: CustomTypeMockConfig,
    fieldId: string
  ): void => {
    if (!customTypeMockConfig) return;

    const updatedConfig = CustomTypeMockConfig.deleteFieldMockConfig(
      customTypeMockConfig,
      fieldId
    );

    dispatch(deleteFieldMockConfigCreator({ mockConfig: updatedConfig }));
  };
}
