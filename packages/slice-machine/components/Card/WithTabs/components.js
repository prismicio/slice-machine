import { Tab, TabList } from 'react-tabs'

// export const CustomTabPanel = ({ children, ...otherProps }) => console.log({ otherProps, h: 2 }) || (
//   <TabPanel {...otherProps}>
//     <h1>{children}</h1>
//     hello bi1?
//   </TabPanel>
// )

// CustomTabPanel.tabsRole = 'TabPanel'

export const CustomTabList = ({ children, ...otherProps }) => (
  <TabList {...otherProps} style={{ borderBottomColor: 'red', position: 'relative' }}>
    {children}
  </TabList>
)

CustomTabList.tabsRole = 'TabList'

export const CustomTab = ({ children, ...otherProps }) => (
  <Tab {...otherProps}
    style={{
      margin: '0',
      top: '0',
      border: 'none',
      bottom: '-1px',
      borderBottom: otherProps.selected ? '1px solid blue' : '1px solid transparent' }}
  >
    {children}
  </Tab>
)

CustomTab.tabsRole = 'Tab'