import { fetchApi } from 'lib/builders/common/fetch'
import { Tab } from '@models/common/CustomType/tab'
import { CustomTypeState } from '@models/ui/CustomTypeState'
import ActionType from './'
import { ToastPayload } from '../../../../src/ToastProvider/utils'


export default function save(dispatch: ({type, payload}: { type: string, payload?: any }) => void) {
  return async (customType: CustomTypeState, setData: (data: ToastPayload) => void = () => {}) => {
    fetchApi({
      url: '/api/custom-types/save',
      params: {
        method: 'POST',
        body: JSON.stringify({
          ...customType,
          model: {
            ...customType.jsonModel,
            tabs: customType.tabs.reduce((acc, value) => ({
              ...acc,
              [value.key]: Tab.toObject(value)
            }), {})
          },
          mockConfig: customType.mockConfig
        })
      },
      setData,
      successMessage: 'Model & mocks have been generated succesfully!',
      onSuccess(_) {
        dispatch({ type: ActionType.Save, payload: { state: customType } })
      }
    })
  }
}