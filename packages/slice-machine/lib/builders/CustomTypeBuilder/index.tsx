import { Box } from 'theme-ui'

import TabZone from './TabZone'
import { Header, Tabs } from './Layout'

import { CustomTypeState } from '../../models/ui/CustomTypeState'
import CustomTypeStore from '../../../src/models/customType/store'
import Container from '../../../components/Container'

const Ct = ({ Model, store }: { Model: CustomTypeState, store: CustomTypeStore }) => {
  return (
    <Box>
      <Container sx={{ pb: 0 }}>
        <Header Model={Model} store={store} />
      </Container>
      <Tabs
        Model={Model}
        renderTab={({ value, sliceZone, key }: { value: any, sliceZone: any, key: string }) => (
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
      />
    </Box>
  )
}

export default Ct