import { IconButton as ThemeIconButton }from 'theme-ui'

const defaultActiveSx = (a) => a ? {
  border: ({ colors }) => `2px solid ${colors.primary}`
} : {
  border: ({ colors }) => `2px solid ${colors.borders}`
}

const IconButton = ({
  sx,
  onClick,
  label,
  Icon,
  size = 18,
  fitButton = false,
  active = false,
  useActive = false,
  activeSx = defaultActiveSx,
  ...rest
}) => (
  <ThemeIconButton
    onClick={onClick}
    aria-label={label}
    type="button"
    sx={{
      ...fitButton ? { width: size, height: size } : null,
      ...useActive && activeSx(active),
      ...sx,
    }}
    {...rest}
  >
    <Icon size={size} />
  </ThemeIconButton>
)

export default IconButton