import { useEffect, useRef } from 'react'
import { Box } from 'theme-ui'

import TabZone from './TabZone'
import { Header, Tabs } from './Layout'

import { CustomTypeState } from '../../models/ui/CustomTypeState'
import CustomTypeStore from '../../../src/models/customType/store'
import Container from '../../../components/Container'
import { UidToggle } from './UidToggle'

const Ct = ({ Model, store, onLeave }: { Model: CustomTypeState, store: CustomTypeStore, onLeave: Function }) => {
  const modelRef = useRef(Model)

  useEffect(() => {
    modelRef.current = Model
  }, [Model])

  useEffect(() => {
    return () => {
      store.reset()
      onLeave(modelRef.current)
    }
  }, [])

  return (
    <Box>
      <Container sx={{ pb: 0 }}>
        <Header Model={Model} store={store} />
      </Container>
      <UidToggle Model={Model} onToggle={() => {}} /> 
      <Tabs
        Model={Model}
        store={store}
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