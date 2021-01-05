import { Box, useThemeUI } from 'theme-ui'
import { Tab, TabList } from 'react-tabs'

// export const CustomTabPanel = ({ children, ...otherProps }) => console.log({ otherProps, h: 2 }) || (
//   <TabPanel {...otherProps}>
//     <h1>{children}</h1>
//     hello bi1?
//   </TabPanel>
// )

// CustomTabPanel.tabsRole = 'TabPanel'

/** 
 * 
 * margin: 0px;
    top: 0px;
    border-top: none;
    border-right: none;
    border-bottom: 1px solid blue;
    border-left: none;
    border-image: initial;
    bottom: -1px;
}
.react-tabs__tab--selected {
    background: #fff;
    border-color: #aaa;
    color: black;
    border-radius: 5px 5px 0 0;
}
.react-tabs__tab {
    display: inline-block;
    border: 1px solid transparent;
    border-bottom: none;
    bottom: -1px;
    position: relative;
    list-style: none;
    padding: 6px 12px;
    cursor: pointer;
*/

export const CustomTabList = ({ children, ...otherProps }) => (
  <Box
    as="ul"
    sx={{ p: 0, m: 0, borderBottom: t => `1px solid ${t.colors.borders}`, position: 'relative' }}
    {...otherProps}
  >
    {children}
  </Box>
)

CustomTabList.tabsRole = 'TabList'

export const CustomTab = ({ children, ...otherProps }) => {
  const { theme } = useThemeUI()
  return (
    <Tab
      {...otherProps}
      style={{
        margin: '0',
        top: '0',
        border: 'none',
        bottom: '-1px',
        border: 'none',
        borderRadius: '0',
        ...otherProps.selected ? {
          color: theme.colors.text,
          backgroundColor: theme.colors.headSection
        } : null
      }}
    >
      {children}
    </Tab>
  )
}

CustomTab.tabsRole = 'Tab'