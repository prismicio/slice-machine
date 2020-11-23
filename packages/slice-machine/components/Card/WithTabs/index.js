import { Flex, Box, Close } from 'theme-ui'
import { Tabs, TabPanel } from 'react-tabs'
import { CustomTab as Tab, CustomTabList as TabList } from './components'
import Card from '../'

const WithTabs = ({
  children,
  FooterContent,
  HeaderContent,
  close,
}) => (
  <Card
    borderFooter
    footerSx={{ p: 0 }}
    bodySx={{ p: 0 }}
    sx={{ border: 'none' }}
    Header={({ radius }) => (
      <Flex
        sx={{
          p: 3,
          pl: 4,
          bg: 'headSection',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
          borderBottom: 'none'
        }}
      >
        { HeaderContent }
        { close ? <Close onClick={close} type="button" /> : null }

      </Flex>
    )}
    Footer={(
      <Flex sx={{ alignItems: 'space-between', bg: 'headSection', p: 3}}>
        <Box sx={{ ml: 'auto' }} />
        { FooterContent }
      </Flex>
    )}
  >
    <Tabs defaultIndex={0} onSelect={index => console.log(index)}>
      <TabList>
        <Tab>Main slice</Tab>
        <Tab>Variations</Tab>
      </TabList>
      <TabPanel></TabPanel>
      <TabPanel></TabPanel>
    </Tabs>
  </Card>
)

export default WithTabs