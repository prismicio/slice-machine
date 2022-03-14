import { CustomTypeMockConfig } from "@lib/models/common/MockConfig";
import {
  deleteFieldMockConfigCreator,
  updateFieldMockConfigCreator,
} from "./actions";
import { Dispatch } from "redux";

export function updateWidgetGroupMockConfig(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: Dispatch<any>
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function updateWidgetMockConfig(dispatch: Dispatch<any>) {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: Dispatch<any>
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deleteWidgetMockConfig(dispatch: Dispatch<any>) {
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
