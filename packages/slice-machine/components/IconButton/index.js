import { IconButton as ThemeIconButton }from 'theme-ui'

const defaultActiveSx = (a, e) => {
  if (e) {
    return {
     border: ({ colors }) => `1px solid ${colors.error}`
    }
  }
  return a ? {
    border: ({ colors }) => `1px solid ${colors.primary}`
  } : {
    border: ({ colors }) => `1px solid ${colors.borders}`
  }
}

const IconButton = ({
  sx = null,
  onClick = null,
  label,
  Icon,
  error = null,
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