import { WidgetsArea } from "../../../../../lib/models/common/Variation";
import { ActionType } from './ActionType'

export function updateWidgetMockConfig(dispatch: ({type, payload}: { type: string, payload?: any }) => void) {
  return (_variationId: string) => {
    return (mockConfig: any, widgetsArea: WidgetsArea, prevId: string, newId: string, updatedValue: any): any => {
      const updatedConfig = {
        ...mockConfig,
        [widgetsArea]: {
          ...mockConfig[widgetsArea],
          ...(prevId !== newId ? {
            [prevId]: undefined,
          } : null),
          [newId]: updatedValue
        }
      }
      dispatch({ type: ActionType.UpdateWidgetMockConfig, payload: updatedConfig })
    }
  }
}

export function deleteWidgetMockConfig(dispatch: ({type, payload}: { type: string, payload?: any }) => void) {
  return (_variationId: string) => {
    return (mockConfig: any, widgetsArea: WidgetsArea, apiId: string): any => {
      if(!mockConfig) return;

      const updatedConfig = {
        ...mockConfig,
        [widgetsArea]: Object.keys(mockConfig[widgetsArea] || {})
          .filter(([k]) => k !== apiId)
          .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})
      }

      dispatch({ type: ActionType.DeleteWidgetMockConfig, payload: updatedConfig })
    }
  }
}