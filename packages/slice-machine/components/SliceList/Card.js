import { Badge, Text, Card as Themecard, Box, Heading, Flex } from 'theme-ui'
import { forwardRef, Fragment } from 'react'

import ReactTooltip from 'react-tooltip'

const textVariation = (variations) => `${variations.length} variation${variations.length > 1 ? 's' : ''}`

const States = {
  NEW_SLICE: 'New',
  MODIFIED: 'Local Update',
  SYNCED: 'Synced',
  PREVIEW_MISSING: 'Preview missing',
  INVALID: 'Contains errors'
}

const StateBadge = ({
  __status,
}) => {

  const state = States[__status]

  return (
    <Badge
      mt="3px"
      pt="2px"
      pb="3px"
      px="8px"
      variant="outline"
    >
      {state}
    </Badge>
  )
}

const Card = forwardRef(({
  slice,
  defaultVariation,
  sx = {},
  hideVariations,
  renderSliceState,
  heightInPx = "287px",
  ...props
}, ref) => {
  const {
    infos,
    jsonModel,
    __status,
  } = slice
  const preview = infos.previewUrls[defaultVariation.id]
  return (
    <Themecard
      {...props}
      tabindex="0"
      role="button"
      aria-pressed="false"
      ref={ref}
      sx={{
        bg: 'transparent',
        border: 'none',
        transition: 'all 100ms cubic-bezier(0.215,0.60,0.355,1)',
        ...sx
      }}
    >
      <Box
        sx={{
          backgroundColor: 'headSection',
          backgroundRepeat: 'repeat',
          backgroundSize: '15px',
          backgroundImage: "url(/pattern.png)",
          height: heightInPx,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          border: ({ colors }) => `1px solid ${colors.borders}`,
          boxShadow: '0px 8px 14px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            backgroundSize: 'contain',
            backgroundPosition: '50%',
            backgroundRepeat: 'no-repeat',
            backgroundImage: "url(" + `${preview && preview.url}` + ")",
          }}
        >
        </Box>
      </Box>

      <Flex>
      <Box py={2} sx={{ flex: '1 1 auto' }}>
        <Heading as="h6" my={2}>{infos.sliceName}</Heading>
        {
          !hideVariations ? (
            <Fragment>
              {jsonModel.variations ? <Text sx={{fontSize: 1, color: 'textClear'}}>{textVariation(jsonModel.variations)}</Text> : null}
            </Fragment>
          ) : null
        }
      </Box>

      <Box py={2}>
        {
          renderSliceState ? (
            <Fragment>{renderSliceState(slice, <StateBadge __status={__status} />)}</Fragment>
          ) : <StateBadge __status={__status} />
        }
        {
          infos.nameConflict ? (
            <Fragment>
              <ReactTooltip type="light" multiline border borderColor={'tomato'} />
              <Badge
                ml={2}
                mt='3px'
                pt='2px'
                pb='3px'
                px='8px'
                bg="error"
                variant='outline'
                sx={{ color: '#FFF' }}
                data-place="bottom"
                data-tip={
                  `Slice name "${infos.nameConflict.sliceName}" can't be transformed<br/> to snake case "${nameConflict.id}". Please update one of these values manually!`
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
  )
})

export default Card