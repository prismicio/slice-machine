import { WidgetsArea } from "../../../../../lib/models/common/Variation"
import { MockConfig } from "../../../../../lib/models/common/MockConfig"
import { ActionType } from './ActionType'

export function updateWidgetMockConfig(dispatch: ({type, payload}: { type: string, payload?: any }) => void) {
  return (_variationId: string) => {
    return (sliceMockConfig: MockConfig, variationId: string, widgetArea: WidgetsArea, fieldId: string, value: any): any => {

      const updatedConfig = MockConfig.updateFieldMockConfig(
        sliceMockConfig,
        variationId,
        widgetArea,
        fieldId,
        value
      )

      console.log({ updatedConfig })
      dispatch({ type: ActionType.UpdateWidgetMockConfig, payload: updatedConfig })
    }
  }
}

export function deleteWidgetMockConfig(dispatch: ({type, payload}: { type: string, payload?: any }) => void) {
  return (_variationId: string) => {
    return (sliceMockConfig: MockConfig, widgetArea: WidgetsArea, fieldId: string): any => {
      if(!sliceMockConfig) return

      const updatedConfig = MockConfig.deleteFieldMockConfig(
        sliceMockConfig,
        _variationId,
        widgetArea,
        fieldId,
      )

      dispatch({ type: ActionType.DeleteWidgetMockConfig, payload: updatedConfig })
    }
  }
}