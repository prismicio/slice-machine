import { WidgetsArea } from "./Variation"

export interface MockConfig {
  [x: string]: any
}

export const MockConfig = {
  getSliceMockConfig(libMockConfig: MockConfig, libName:string, sliceName:string) {
    return libMockConfig?.[libName]?.[sliceName] || {}
  },
  getVariationMockConfig(sliceMockConfig: MockConfig, variationId:string) {
    return sliceMockConfig[variationId] || {}
  },
  getFieldMockConfig(sliceMockConfig: MockConfig, variationId: string, widgetArea: WidgetsArea, fieldId: string) {
    return this.getVariationMockConfig(sliceMockConfig, variationId)[widgetArea]?.[fieldId] || {}
  },
  deleteFieldMockConfig(sliceMockConfig: MockConfig, variationId: string, widgetArea: WidgetsArea, fieldId: string) {
    return {
      ...sliceMockConfig,
      [variationId]: {
        ...this.getVariationMockConfig(sliceMockConfig, variationId),
        [widgetArea]: {
          ...this.getVariationMockConfig(sliceMockConfig, variationId)[widgetArea],
          [fieldId]: undefined
        }
      }
    }
  },
  updateFieldMockConfig(sliceMockConfig: MockConfig, variationId: string, widgetArea: WidgetsArea, fieldId: string, value: any) {
    return {
      ...sliceMockConfig,
      [variationId]: {
        ...this.getVariationMockConfig(sliceMockConfig, variationId),
        [widgetArea]: {
          ...this.getVariationMockConfig(sliceMockConfig, variationId)[widgetArea],
          [fieldId]: value
        }
      }
    }
  }
}