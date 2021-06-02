// export function updateWidgetMockConfig(dispatch: ({type, payload}: { type: string, payload?: any }) => void) {
//   return () => {
//     return (mockConfig: any, prevId: string, newId: string, updatedValue: any): any => {
//       const updatedConfig = {
//         ...mockConfig,
//         ...(prevId !== newId ? {
//             [prevId]: undefined,
//           } : null),
//           [newId]: updatedValue
//       }
//       dispatch({ type: Actions.UpdateWidgetMockConfig, payload: updatedConfig })
//     }
//   }
// }

// export function deleteWidgetMockConfig(dispatch: ({type, payload}: { type: string, payload?: any }) => void) {
//   return () => {
//     return (mockConfig: any, apiId: string): any => {
//       if(!mockConfig) return;

//       const updatedConfig = Object.keys(mockConfig)
//         .filter(([k]) => k !== apiId)
//         .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})

//       dispatch({ type: Actions.DeleteWidgetMockConfig, payload: updatedConfig })
//     }
//   }
// }

import { CustomTypeMockConfig } from "../../../../lib/models/common/MockConfig"
import Actions from './'

export function updateWidgetGroupMockConfig(dispatch: ({type, payload}: { type: string, payload?: any }) => void) {
  return (customTypeMockConfig: CustomTypeMockConfig, groupId:string, previousFieldId: string, fieldId: string, value: any): any => {
    const updatedConfig = CustomTypeMockConfig.updateGroupFieldMockConfig(
      customTypeMockConfig,
      groupId,
      previousFieldId,
      fieldId,
      value
    )
    // you can use same dispatch her
    dispatch({ type: Actions.UpdateWidgetMockConfig, payload: updatedConfig })
  }
}
export function updateWidgetMockConfig(dispatch: ({type, payload}: { type: string, payload?: any }) => void) {
  return (customTypeMockConfig: CustomTypeMockConfig, previousFieldId: string, fieldId: string, value: any): any => {
    if(!customTypeMockConfig) return
    const updatedConfig = CustomTypeMockConfig.updateFieldMockConfig(
      customTypeMockConfig,
      previousFieldId,
      fieldId,
      value
    )
    dispatch({ type: Actions.UpdateWidgetMockConfig, payload: updatedConfig })
  }
}

export function deleteWidgetGroupMockConfig(dispatch: ({type, payload}: { type: string, payload?: any }) => void) {
  return (customTypeMockConfig: CustomTypeMockConfig, groupId: string, fieldId: string): any => {
    if(!customTypeMockConfig) return

    const updatedConfig = CustomTypeMockConfig.deleteGroupFieldMockConfig(
      customTypeMockConfig,
      groupId,
      fieldId,
    )

    dispatch({ type: Actions.DeleteWidgetMockConfig, payload: updatedConfig })
  }
    
}

export function deleteWidgetMockConfig(dispatch: ({type, payload}: { type: string, payload?: any }) => void) {
  return (customTypeMockConfig: CustomTypeMockConfig, fieldId: string): any => {
    if(!customTypeMockConfig) return

    const updatedConfig = CustomTypeMockConfig.deleteFieldMockConfig(
      customTypeMockConfig,
      fieldId,
    )

    dispatch({ type: Actions.DeleteWidgetMockConfig, payload: updatedConfig })
  }
    
}