import { fetchApi } from '../../../../lib/builders/common/fetch'
import { CustomTypeState } from '../../../../lib/models/ui/CustomTypeState'
import ActionType from './'
import { ToastPayload } from '../../../../src/ToastProvider/utils'



export default function push(dispatch: ({type, payload}: { type: string, payload?: any }) => void) {
  return async (ct: CustomTypeState, setData: (data: ToastPayload) => void) => {
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
