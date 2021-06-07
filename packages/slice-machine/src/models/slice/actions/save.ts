import { Variation } from '../../../../lib/models/common/Variation'
import { fetchApi } from '../../../../lib/builders/common/fetch'
import SliceState from '../../../../lib/models/ui/SliceState'
import { Preview } from '../../../../lib/models/common/Component'
import { ActionType } from './ActionType'
import { ToastPayload } from '../../../../src/ToastProvider/utils'

export default function save(dispatch: ({type, payload}: { type: string, payload?: any }) => void) {
  return async (slice: SliceState, setData: (data: ToastPayload) => void = () => {}) => {
    fetchApi({
      url: '/api/slices/save',
      params: {
        method: 'POST',
        body: JSON.stringify({
          sliceName: slice.infos.sliceName,
          from: slice.from,
          model: {
            ...slice.jsonModel,
            variations: slice.variations.map(Variation.toObject)
          },
          mockConfig: slice.mockConfig
        })
      },
      setData,
      successMessage: 'Model & mocks have been generated succesfully!',
      onSuccess({ previewUrls }: { previewUrls: { [variationId: string]: Preview }}){
        const savedState = {
          ...slice,
          infos: {
            ...slice.infos,
            previewUrls
          },
          initialMockConfig: slice.mockConfig,
          initialVariations: slice.variations
        }
        dispatch({ type: ActionType.Save, payload: { state: savedState } })
      }
    })
  }
}