import { fetchApi } from '../../../../../lib/builder/fetch'
import { ActionType } from './ActionType'
import { Preview } from '../../../../../lib/models/common/Component'


export function generateScreenShot(dispatch: ({type, payload}: { type: string, payload?: any }) => void) {
  return (variationId: string) => {
    return async (libFrom: string, sliceName: string, variationName: string, setData: (data: object) => void) => {
      fetchApi({
        url: `/api/screenshot?sliceName=${sliceName}&from=${libFrom}&variationName=${variationName}`,
        setData,
        data: { onLoad: { imageLoading: true }, onResponse: { imageLoading: false } },
        successMessage: 'Model & mocks have been generated succesfully!',
        onSuccess(preview: Preview) {
          if(preview.hasPreview) {
            dispatch({ type: ActionType.GenerateScreenShot, payload: { variationId, preview } })
          }
        }
      })
    }
  }
}

export function generateCustomScreenShot(dispatch: ({type, payload}: { type: string, payload?: any }) => void) {
  return (variationId: string) => {
    return async (libFrom: string, sliceName: string, variationName: string, setData: (data: object) => void, file: Blob) => {
      const form = new FormData()
      Object.entries({ sliceName, variationName, from: libFrom })
        .forEach(([key, value]) => form.append(key, value))

      form.append('file', file)

      fetchApi({
        url: '/api/custom-screenshot',
        setData,
        params: {
          method: 'POST',
          body: form,
          headers: {}
        },
        data: { onLoad: { imageLoading: true }, onResponse: { imageLoading: false } },
        successMessage: 'New screenshot added!',
        onSuccess(preview: Preview) {
          if(preview.hasPreview) {
            dispatch({ type: ActionType.GenerateScreenShot, payload: { variationId, preview } })
          }
        }
      })
    }
  }
}