/* eslint-disable */
import { WidgetsArea } from "./Variation";

// interface SliceMockConfig {
//   [variationId: string]: {
//     primary?: {
//       [fieldId: string]: {
//         config?: any,
//         content?: any
//       }
//     },
//     items?: {
//       [fieldId: string]: {
//         config?: any,
//         content?: any
//       }
//     },
//   }
// }

export interface SliceMockConfig {
  [x: string]: any;
}

export interface GlobalMockConfig {
  [x: string]: any;
}

export const SliceMockConfig = {
  getSliceMockConfig(
    globalMockConfig: GlobalMockConfig,
    libName: string,
    sliceName: string
  ) {
    return globalMockConfig?.[libName]?.[sliceName] || {};
  },
  getVariationMockConfig(
    sliceMockConfig: SliceMockConfig,
    variationId: string
  ) {
    return sliceMockConfig[variationId] || {};
  },
  getFieldMockConfig(
    sliceMockConfig: SliceMockConfig,
    variationId: string,
    widgetArea: WidgetsArea,
    fieldId: string
  ) {
    return (
      this.getVariationMockConfig(sliceMockConfig, variationId)[widgetArea]?.[
        fieldId
      ] || {}
    );
  },
  deleteFieldMockConfig(
    sliceMockConfig: SliceMockConfig,
    variationId: string,
    widgetArea: WidgetsArea,
    fieldId: string
  ) {
    return {
      ...sliceMockConfig,
      [variationId]: {
        ...this.getVariationMockConfig(sliceMockConfig, variationId),
        [widgetArea]: {
          ...this.getVariationMockConfig(sliceMockConfig, variationId)[
            widgetArea
          ],
          [fieldId]: undefined,
        },
      },
    };
  },
  updateFieldMockConfig(
    sliceMockConfig: SliceMockConfig,
    variationId: string,
    widgetArea: WidgetsArea,
    previousKey: string,
    fieldId: string,
    value: any
  ) {
    return {
      ...sliceMockConfig,
      [variationId]: {
        ...this.getVariationMockConfig(sliceMockConfig, variationId),
        [widgetArea]: {
          ...this.getVariationMockConfig(sliceMockConfig, variationId)[
            widgetArea
          ],
          ...(fieldId !== previousKey
            ? {
                [previousKey]: undefined,
                [fieldId]: value,
              }
            : {
                [fieldId]: value,
              }),
        },
      },
    };
  },
};

export interface CustomTypeMockConfig {
  [x: string]: any;
}

export const CustomTypeMockConfig = {
  getCustomTypeMockConfig(globalMockConfig: GlobalMockConfig, ctId: string) {
    return globalMockConfig?._cts?.[ctId] || {};
  },
  getFieldMockConfig(ctMockConfig: CustomTypeMockConfig, fieldId: string) {
    return ctMockConfig[fieldId] || {};
  },
  deleteFieldMockConfig(ctMockConfig: CustomTypeMockConfig, fieldId: string) {
    return {
      ...ctMockConfig,
      [fieldId]: undefined,
    };
  },
  updateFieldMockConfig(
    ctMockConfig: CustomTypeMockConfig,
    previousFieldId: string,
    fieldId: string,
    value: any
  ) {
    return {
      ...ctMockConfig,
      ...(previousFieldId !== fieldId
        ? {
            [previousFieldId]: undefined,
            [fieldId]: value,
          }
        : {
            [fieldId]: value,
          }),
    };
  },
  updateGroupFieldMockConfig(
    ctMockConfig: CustomTypeMockConfig,
    groupId: string,
    previousFieldId: string,
    fieldId: string,
    value: any
  ) {
    return {
      ...ctMockConfig,
      [groupId]: {
        ...this.getFieldMockConfig(ctMockConfig, groupId),
        ...(previousFieldId !== fieldId
          ? {
              [fieldId]: value,
              [previousFieldId]: undefined,
            }
          : {
              [fieldId]: value,
            }),
      },
    };
  },
  deleteGroupFieldMockConfig(
    ctMockConfig: CustomTypeMockConfig,
    groupId: string,
    fieldId: string
  ) {
    return {
      ...ctMockConfig,
      [groupId]: {
        ...this.getFieldMockConfig(ctMockConfig, groupId),
        [fieldId]: undefined,
      },
    };
  },
};
