import { CustomTypeState } from '../../../models/ui/CustomTypeState'
// import IconButton from 'components/IconButton'

import { Box, Flex } from 'theme-ui'
import { Tabs, TabPanel } from 'react-tabs'
// import { AiOutlineEdit } from 'react-icons/ai'

import { CustomTab as Tab, CustomTabList as TabList } from '../../../../components/Card/WithTabs/components'

import FlexWrapper from './FlexWrapper'

// const Icon = ({ theme, onClick }: { theme: any, onClick: Function }) => (
//   <IconButton
//     size={22}
//     error={null}
//     Icon={AiOutlineEdit}
//     label="Edit slice field"
//     sx={{ cursor: "pointer", color: theme.colors.icons }}
//     onClick={onClick}
//   />
// )

const CtTabs = ({ sx, Model, renderTab }: { sx?: any, Model: CustomTypeState, renderTab: Function }) => {
  //const { theme } = useThemeUI()
  return (
    <Box sx={{ bg: 'backgroundClear' }}>
      <FlexWrapper sx={sx}>
        <Tabs style={{ width: '100%' }}>
          <TabList>
            {
              Model.tabs.map((tab) => (
                <Tab
                  key={tab.key}
                  style={{ display: 'flex' }}
                >
                  <Flex sx={{ alignItems: 'center' }}>
                    {tab.key}
                    {/* &nbsp;
                    <Icon theme={theme} onClick={console.log} /> */}
                  </Flex>
                </Tab>
              ))
            }
          </TabList>
          {
            Model.tabs.map(tab => <TabPanel key={tab.key}>{renderTab(tab)}</TabPanel>)
          }
        </Tabs>
      </FlexWrapper>
    </Box>
  )
}

export default CtTabs