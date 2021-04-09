import { useRouter } from 'next/router'
import { useContext } from 'react'
import { Box } from 'theme-ui'

import { CustomTypesContext } from "src/models/customTypes/context"

import TabZone from 'lib/builders/CustomTypeBuilder/TabZone'

import { useModelReducer } from 'src/models/customType/modelReducer'
import { CustomTypeState } from 'lib/models/common/ui/CustomTypeState'
import CustomTypeStore from 'src/models/customType/store'
import { CustomType } from 'lib/models/common/CustomType'
import { TabsAsObject } from 'lib/models/common/CustomType/tab'

const Ct = ({ Model, store }: { Model: CustomTypeState, store: CustomTypeStore }) => {
  return (
    <Box p={4}>
      {
        Model.isTouched ? 'is touched' : 'is not touched'
      }<br/>
      <button onClick={() => store.test()}>create Tab</button>
      <button onClick={() => store.reset()}>reset model</button>
      <h3>{Model.key}</h3>
      {
        Model.tabs.map(({
              key,
              sliceZone,
              value,
            }) => (
          <Box key={key} p={2} sx={{ border: '1px solid #F1F1F1'}}>
            <TabZone
              fields={value}
              Model={Model}
              store={store}
              sliceZone={sliceZone}
              showHints={true}
              tabId={key}
            />
          </Box>
        ))
      }
      <pre>
        { JSON.stringify(Model.mockConfig)}
      </pre>
    </Box>
  )
}

const WithProvider = ({ customType }: { customType: CustomType<TabsAsObject> }) => {
  const [Model, store] = useModelReducer({ customType })
  return (<Ct Model={Model} store={store} />)
}

const WithRouter = () => {
  const router = useRouter()
  const { customTypes } = useContext(CustomTypesContext)

  const customType = customTypes.find((e: CustomType<TabsAsObject>) => e.id === router.query.ct)
  if (!customType) {
    router.replace('/cts')
    return null
  }
  return <WithProvider customType={customType} />
}

export default WithRouter
