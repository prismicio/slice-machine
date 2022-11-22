import type Models from "@prismic-beta/slicemachine-core/build/models";

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
  getGroupFieldMockConfig(
    ctMockConfig: CustomTypeMockConfig,
    groupId: string,
    fieldId: string
  ): Partial<Record<string, unknown>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const groupConfig = this.getFieldMockConfig(ctMockConfig, groupId);
    return (groupConfig[fieldId] || {}) as Partial<Record<string, unknown>>;
  },
  deleteFieldMockConfig(
    ctMockConfig: CustomTypeMockConfig,
    fieldId: string
  ): CustomTypeMockConfig {
    if (!ctMockConfig[fieldId]) return ctMockConfig;
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
    const newCtMockConfig = { ...ctMockConfig };
    delete newCtMockConfig[previousFieldId];
    return {
      ...newCtMockConfig,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      [fieldId]: value,
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
    const groupIdMock = this.getFieldMockConfig(ctMockConfig, groupId);
    delete groupIdMock[previousFieldId];
    return {
      ...ctMockConfig,
      [groupId]: {
        ...groupIdMock,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [fieldId]: value,
      },
    };
  },
  deleteGroupFieldMockConfig(
    ctMockConfig: CustomTypeMockConfig,
    groupId: string,
    fieldId: string
  ) {
    const groupMock = this.getFieldMockConfig(
      ctMockConfig,
      groupId
    ) as CustomTypeMockConfig;
    return {
      ...ctMockConfig,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      [groupId]: this.deleteFieldMockConfig(groupMock, fieldId),
    };
  },
};
