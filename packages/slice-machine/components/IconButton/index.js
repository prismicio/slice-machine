import { IconButton as ThemeIconButton }from 'theme-ui'

const defaultActiveSx = (a, e) => {
  if (e) {
    return {
     border: ({ colors }) => `2px solid ${colors.error}`
    }
  }
  return a ? {
    border: ({ colors }) => `2px solid ${colors.primary}`
  } : {
    border: ({ colors }) => `2px solid ${colors.borders}`
  }
}

const IconButton = ({
  sx,
  onClick,
  label,
  Icon,
  error,
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
      ...useActive && activeSx(active, error),
      ...sx,
    }}
    {...rest}
  >
    <Icon size={size} />
  </ThemeIconButton>
)

export default IconButton