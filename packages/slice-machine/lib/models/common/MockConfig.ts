import type Models from "@slicemachine/core/build/models";

export interface SliceMockConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
}

export interface GlobalMockConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
}

export const SliceMockConfig = {
  getSliceMockConfig(
    globalMockConfig: GlobalMockConfig,
    libName: string,
    sliceName: string
  ): Record<string, Record<string, Record<string, unknown>>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return globalMockConfig?.[libName]?.[sliceName] || {};
  },
  getVariationMockConfig(
    sliceMockConfig: SliceMockConfig,
    variationId: string
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return sliceMockConfig[variationId] || {};
  },
  getFieldMockConfig(
    sliceMockConfig: SliceMockConfig,
    variationId: string,
    widgetArea: Models.WidgetsArea,
    fieldId: string
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.getVariationMockConfig(sliceMockConfig, variationId)[widgetArea]?.[
        fieldId
      ] || {}
    );
  },
  deleteFieldMockConfig(
    sliceMockConfig: SliceMockConfig,
    variationId: string,
    widgetArea: Models.WidgetsArea,
    fieldId: string
  ) {
    return {
      ...sliceMockConfig,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      [variationId]: {
        ...this.getVariationMockConfig(sliceMockConfig, variationId),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [widgetArea]: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
    widgetArea: Models.WidgetsArea,
    previousKey: string,
    fieldId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) {
    return {
      ...sliceMockConfig,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      [variationId]: {
        ...this.getVariationMockConfig(sliceMockConfig, variationId),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [widgetArea]: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          ...this.getVariationMockConfig(sliceMockConfig, variationId)[
            widgetArea
          ],
          ...(fieldId !== previousKey
            ? {
                [previousKey]: undefined,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                [fieldId]: value,
              }
            : {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                [fieldId]: value,
              }),
        },
      },
    };
  },
};

export interface CustomTypeMockConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: Partial<Record<string, unknown>> | undefined;
}

export const CustomTypeMockConfig = {
  getCustomTypeMockConfig(
    globalMockConfig: GlobalMockConfig,
    ctId: string
  ): CustomTypeMockConfig {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return globalMockConfig?._cts?.[ctId] || {};
  },
  getFieldMockConfig(
    ctMockConfig: CustomTypeMockConfig,
    fieldId: string
  ): Partial<Record<string, unknown>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return ctMockConfig[fieldId] || {};
  },
  deleteFieldMockConfig(
    ctMockConfig: CustomTypeMockConfig,
    fieldId: string
  ): CustomTypeMockConfig {
    return {
      ...ctMockConfig,
      [fieldId]: undefined,
    };
  },
  updateFieldMockConfig(
    ctMockConfig: CustomTypeMockConfig,
    previousFieldId: string,
    fieldId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) {
    return {
      ...ctMockConfig,
      ...(previousFieldId !== fieldId
        ? {
            [previousFieldId]: undefined,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            [fieldId]: value,
          }
        : {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            [fieldId]: value,
          }),
    };
  },
  updateGroupFieldMockConfig(
    ctMockConfig: CustomTypeMockConfig,
    groupId: string,
    previousFieldId: string,
    fieldId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any
    value: any
  ) {
    return {
      ...ctMockConfig,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      [groupId]: {
        ...this.getFieldMockConfig(ctMockConfig, groupId),
        ...(previousFieldId !== fieldId
          ? {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
              [fieldId]: value,
              [previousFieldId]: undefined,
            }
          : {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      [groupId]: {
        ...this.getFieldMockConfig(ctMockConfig, groupId),
        [fieldId]: undefined,
      },
    };
  },
};
