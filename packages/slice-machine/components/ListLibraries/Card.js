import { Badge, Text, Card as Themecard, Image, Box, Heading } from 'theme-ui'
import { forwardRef } from 'react'

const textVariation = (variations) => `${variations.length} variation${variations.length > 1 ? 's' : ''}`

const StateBadge = ({
  isModified,
  isNew,
  isValid
}) => {
  if (!isValid) {
    return <Badge mr={2}>Contains errors</Badge>
  }
  if (isModified) {
    return <Badge mr={2}>Modified</Badge>
  }
  if (isNew) {
    return <Badge mr={2}>New</Badge>
  }
  return <Badge mr={2}>Synced</Badge>
}

const Card = forwardRef(({ sliceName, previewUrl, model, isModified, isNew, isValid, ...props }, ref) => (
  <Themecard
    {...props}
    tabindex="0"
    role="button"
    aria-pressed="false"
    ref={ref}
    sx={{
      bg: '#FFF',
      cursor: 'pointer',
      borderRadius: '3px',
      border: ({ colors }) => `1px solid ${colors.borders}`,
      '&:hover': {
        border: ({ colors }) => `1px solid ${colors.primary}`,
        boxShadow: '0 0 8px rgba(0, 0, 0, 0.125)'
      },
      mb: 3
    }}
  >
    <Image src={previewUrl} />
    <Box p={3}>
      <Heading as="h4">{sliceName}</Heading>
      {model && model.variations ? <Text>{textVariation(model.variations)}</Text> : null}
      <StateBadge isModified={isModified} isNew={isNew} isValid={isValid} />
    </Box>
  </Themecard>
))

export default Card