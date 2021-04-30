import { fetchApi } from '../../../../lib/builder/fetch'
import { CustomTypeState } from '../../../../lib/models/ui/CustomTypeState'
import ActionType from './'


export default function push(dispatch: ({type, payload}: { type: string, payload?: any }) => void) {
  return async (ct: CustomTypeState, setData: (data: object) => void) => {
    fetchApi({
      url: `/api/custom-types/push?id=${ct.id}`,
      setData,
      successMessage: 'Model was correctly saved to Prismic!',
      onSuccess() {
        dispatch({ type: ActionType.Push })
      }
    })
  }
}
