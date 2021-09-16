import { useThemeUI } from 'theme-ui'
import ReactTooltip from 'react-tooltip'

const Tooltip = (props) => {
  const { theme, colorMode } = useThemeUI()
  return (
    <ReactTooltip
      border
      multiline
      borderColor={theme.colors.borders}
      place="top"
      type={colorMode === 'dark' ? 'dark' : 'light'}
      {...props}
    />
  )
}

export default Tooltip
