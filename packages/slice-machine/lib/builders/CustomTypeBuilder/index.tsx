import { Box } from 'theme-ui'

import TabZone from './TabZone'
import { Header, Tabs } from './Layout'

import { CustomTypeState } from '../../models/ui/CustomTypeState'
import CustomTypeStore from '../../../src/models/customType/store'

const Ct = ({ Model, store }: { Model: CustomTypeState, store: CustomTypeStore }) => {
  return (
    <main>
      <Header Model={Model} />
      <Tabs
        Model={Model}
        renderTab={({ value, sliceZone, key }) => (
          <Box sx={{ mt: 4 }}>
            <TabZone
              fields={value}
              Model={Model}
              store={store}
              sliceZone={sliceZone}
              showHints={true}
              tabId={key}
            />
          </Box>
        )}
        sx={{ bg: 'backgroundClear', px: 2 }}
      />
      <pre>
        { JSON.stringify(Model.mockConfig)}
      </pre>
    </main>
  )
}

export default Ct