import { Badge, Text, Card as Themecard, Box, Heading, Flex } from 'theme-ui'
import { forwardRef, useState, useEffect, Fragment } from 'react'

import ReactTooltip from 'react-tooltip'

const textVariation = (variations) => `${variations.length} variation${variations.length > 1 ? 's' : ''}`

const StateBadge = ({
  isNew,
  isValid,
  isModified,
  hasPreview,
  sliceName,
  previewUrl,
}) => {

  if (sliceName === 'CallToAction3') {
    console.log({
      previewUrl
    })
  }
  const [imageFailed, setimageFailed] = useState(false)

  // useEffect(() => {
  //   console.log('test image', sliceName)
  //   const tester = new Image()
  //   tester.addEventListener('error', () => {
  //     console.log('image failed ', sliceName, previewUrl)
  //     setimageFailed(true)
  //   })
  //   tester.src = previewUrl
  // })

  const state = (() => {
    if (!previewUrl) {
      return 'Preview missing'
    }
    if (!isValid) {
      return 'Contains errors'
    }
    if (isNew) {
      return 'New'
    }
    if (isModified) {
      return 'Local Update'
    }
    return 'Synced'
  })();
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
  sliceName,
  previewUrl,
  model,
  isModified,
  isNew,
  isValid,
  nameConflict,
  hasPreview,
  ...props
}, ref) => {
  const previewPlainUrl = `${previewUrl}&plain=true`

  return (
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
          backgroundImage: "url(/pattern.png)",
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
            backgroundImage: "url(" + `${previewPlainUrl}` + ")",
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
        <StateBadge
          sliceName={sliceName}
          hasPreview={hasPreview}
          previewUrl={previewPlainUrl}
          isModified={isModified}
          isNew={isNew}
          isValid={isValid}
        />
        {
          nameConflict ? (
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
  )
})

export default Card