import { CustomTypeState } from '../../../models/ui/CustomTypeState'

import { Box } from 'theme-ui'
import { Tabs, TabPanel } from 'react-tabs'
import { CustomTab as Tab, CustomTabList as TabList } from '../../../../components/Card/WithTabs/components'

import FlexWrapper from './FlexWrapper'

const CtTabs = ({ sx, Model, renderTab }: { sx: any, Model: CustomTypeState, renderTab: Function }) => {
  return (
    <Box sx={{ bg: 'backgroundClear' }}>
      <FlexWrapper sx={sx}>
        <Tabs>
          <TabList>
            {
              Model.tabs.map((tab) => (
                <Tab key={tab.key}>{tab.key}</Tab>
              ))
            }
          </TabList>
          {
            Model.tabs.map(tab => renderTab(tab))
          }
        </Tabs>
      </FlexWrapper>
    </Box>
  )
}

export default CtTabs