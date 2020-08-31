import { IconButton as ThemeIconButton }from 'theme-ui'

const IconButton = ({ onClick, label, Icon, size = 18, ...rest }) => (
  <ThemeIconButton
    onClick={onClick}
    aria-label={label}
    {...rest}
  >
    <Icon size={size} />
  </ThemeIconButton>
)

export default IconButton