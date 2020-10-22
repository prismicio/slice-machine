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
    return <Badge mt='3px' pt='2px' pb='3px' px='8px' variant='outline'>Contains errors</Badge>
  }
  if (isModified) {
    return <Badge mt='3px' pt='2px' pb='3px' px='8px' variant='outline'>Modified</Badge>
  }
  if (isNew) {
    return <Badge mt='3px' pt='2px' pb='3px' px='8px' variant='outline'>New</Badge>
  }
  return <Badge mt='3px' pt='2px' pb='3px' px='8px' variant='outline'>Synced</Badge>
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
      bg: 'transparent',
      cursor: 'pointer',
      borderRadius: '0',
      border: 'none',
      mb: 3
    }}
  >
    <Box
      sx={{
        backgroundColor: 'headSection',
        backgroundRepeat: 'repeat',
        backgroundSize: '15px',
        backgroundImage: "url(https://images.prismic.io/testtrere/d14932cf-083b-4f60-b492-b77a65e2c393_bg-pattern.png)",
        height: '290px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        border: ({ colors }) => `1px solid ${colors.borders}`,
        boxShadow: '0 10px 10px rgba(0, 0, 0, 0.05)'
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          backgroundSize: 'contain',
          backgroundPosition: '50%',
          backgroundRepeat: 'no-repeat',
          backgroundImage: "url(" + `${previewUrl}` + ")",
        }}
      >
      </Box>
    </Box>

    <Flex>
    <Box py={2} sx={{ flex: '1 1 auto' }}>
      <Heading as="h6" my={2}>{sliceName}</Heading>
      {model && model.variations ? <Text sx={{fontSize: 1, color: 'textClear'}}>{textVariation(model.variations)}</Text> : null}
    </Box>

    <Box py={2}>
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
    </Flex>

  </Themecard>
))

export default Card