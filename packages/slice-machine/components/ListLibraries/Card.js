import { Badge, Text, Card as Themecard, Image, Box, Heading, Flex } from 'theme-ui'
import { forwardRef, Fragment } from 'react'

import ReactTooltip from 'react-tooltip'

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

const Card = forwardRef(({
  sliceName,
  previewUrl,
  model,
  isModified,
  isNew,
  isValid,
  nameConflict,
  ...props
}, ref) => (
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
    <Flex sx={{ bg: '#F1F1F1', height: '220px', alignItems: 'center', justifyContent: 'center' }}>
      <Image src={previewUrl} sx={{ maxHeight: '100%' }} />
    </Flex>
    <Box p={3}>
      <Heading as="h4">{sliceName}</Heading>
      {model && model.variations ? <Text>{textVariation(model.variations)}</Text> : null}
      <StateBadge isModified={isModified} isNew={isNew} isValid={isValid} />
      {
        nameConflict ? (
          <Fragment>
            <ReactTooltip type="light" multiline border borderColor={'tomato'} />
            <Badge
              mr={2}
              bg="error"
              data-place="bottom"
              data-tip={
                `Slice name "${nameConflict.sliceName}" can't be transformed<br/> to snake case "${nameConflict.id}". Please update one of these values manually!`
              }
            >
              Name conflict
            </Badge>
          </Fragment>
        ) : null
      }
    </Box>
  </Themecard>
))

export default Card