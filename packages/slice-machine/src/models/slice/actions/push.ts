import { fetchApi } from '../../../../lib/builder/fetch'
import SliceState from '../../../../lib/models/ui/SliceState'
import { ActionType } from './ActionType'


export default function push(dispatch: ({type, payload}: { type: string, payload?: any }) => void) {
  return async (slice: SliceState, setData: (data: object) => void) => {
    fetchApi({
      url: `/api/push?sliceName=${slice.infos.sliceName}&from=${slice.from}`,
      setData,
      successMessage: 'Model was correctly saved to Prismic!',
      onSuccess() {
        dispatch({ type: ActionType.Push })
      }
    })
  }
}
