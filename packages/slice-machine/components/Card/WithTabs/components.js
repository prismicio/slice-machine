import { Box, useThemeUI } from 'theme-ui'
import { Tab } from 'react-tabs'

export const CustomTabList = ({ children, ...otherProps }) => (
  <Box
    as="ul"
    sx={{
      p: 0,
      m: 0,
      px: theme => `calc(${theme.space[3]}px + 8px)`,
      bg: 'headSection',
      position: 'relative'
    }}
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
          borderBottom: `3px solid ${theme.colors.primary}`,
          color: theme.colors.text,
          backgroundColor: theme.colors.headSection
        } : {
          borderBottom: '3px solid transparent'
        }
      }}
    >
      {children}
    </Tab>
  )
}

CustomTab.tabsRole = 'Tab'