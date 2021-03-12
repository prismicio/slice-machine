import { fetchApi } from '../../../../lib/builder/fetch'
import { SliceState } from '../../../../lib/models/ui/SliceState'
import { ActionType } from './ActionType'


export function generateScreenShot(dispatch: ({type, payload}: { type: string, payload?: any }) => void) {
  return async (slice: SliceState, setData: (data: object) => void) => {
    console.log(`/api/screenshot?sliceName=${slice.infos.sliceName}&from=${slice.from}`)
    fetchApi({
      url: `/api/screenshot?sliceName=${slice.infos.sliceName}&from=${slice.from}`,
      setData,
      data: { onLoad: { imageLoading: true }, onResponse: { imageLoading: false } },
      successMessage: 'Model & mocks have been generated succesfully!',
      onSuccess(previewUrl: string) {
        if(previewUrl) {
          dispatch({ type: ActionType.GenerateScreenShot, payload: previewUrl })
        }
      }
    })
  }
}

export function generateCustomScreenShot(dispatch: ({type, payload}: { type: string, payload?: any }) => void) {
  return async (slice: SliceState, setData: (data: object) => void, file: Blob) => {
    const form = new FormData()
    Object.entries({ sliceName: slice.infos.sliceName, from: slice.from })
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
      onSuccess(previewUrl: string) {
        dispatch({ type: ActionType.GenerateScreenShot, payload: previewUrl })
      }
    })
  }
}