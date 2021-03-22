import { Variation } from '../../../../lib/models/common/Variation'
import { fetchApi } from '../../../../lib/builder/fetch'
import { SliceState } from '../../../../lib/models/ui/SliceState'
import { Preview } from '../../../../lib/models/common/Component'
import { ActionType } from './ActionType'


export default function save(dispatch: ({type, payload}: { type: string, payload?: any }) => void) {
  return async (slice: SliceState, setData: (data: object) => void = () => {}) => {
    fetchApi({
      url: '/api/update',
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
          initialVariations: slice.variations
        }
        dispatch({ type: ActionType.Save, payload: { state: savedState } })
      }
    })
  }
}