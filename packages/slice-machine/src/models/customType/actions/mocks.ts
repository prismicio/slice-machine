import Actions from './'

export function updateWidgetMockConfig(dispatch: ({type, payload}: { type: string, payload?: any }) => void) {
  return () => {
    return (mockConfig: any, prevId: string, newId: string, updatedValue: any): any => {
      const updatedConfig = {
        ...mockConfig,
        ...(prevId !== newId ? {
            [prevId]: undefined,
          } : null),
          [newId]: updatedValue
      }
      dispatch({ type: Actions.UpdateWidgetMockConfig, payload: updatedConfig })
    }
  }
}

export function deleteWidgetMockConfig(dispatch: ({type, payload}: { type: string, payload?: any }) => void) {
  return () => {
    return (mockConfig: any, apiId: string): any => {
      if(!mockConfig) return;

      const updatedConfig = Object.keys(mockConfig)
        .filter(([k]) => k !== apiId)
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})

      dispatch({ type: Actions.DeleteWidgetMockConfig, payload: updatedConfig })
    }
  }
}