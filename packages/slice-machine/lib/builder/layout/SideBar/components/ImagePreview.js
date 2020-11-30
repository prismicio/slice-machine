import { useState, Fragment } from 'react'
import { Flex, Image, Button, Text, Spinner } from 'theme-ui'

const ImagePreview = ({ src, onScreenshot, isCustomPreview, imageLoading, preventScreenshot }) => {
  const [display, setDisplay] = useState(false)
  const handleMouseHover = (state) => setDisplay(state)

  return (
    <Flex
      sx={{
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        height: '290px',
        overflow: 'hidden',
        backgroundImage: "url(/pattern.png)",
        backgroundColor: 'headSection',
        backgroundRepeat: 'repeat',
        backgroundSize: '15px',
        boxShadow: '0 10px 10px rgba(0, 0, 0, 0.05)',
      }}
      onMouseEnter={() => handleMouseHover(true)}
      onMouseLeave={() => handleMouseHover(false)}
    >
      {
        (display || imageLoading) ? (
          <Flex
            sx={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              background: 'rgba(0,0,0,.4)',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: '0'
            }}
          >
            {
              display ? (
                <Fragment>
                  {
                    isCustomPreview ? (
                      <Text sx={{ color: '#FFF' }} as="h3">Uses Custom Preview</Text>
                    ) : (
                      <Fragment>
                        { preventScreenshot
                          ? <Text sx={{ color: '#FFF' }} as="h3">Storybook not running</Text>
                          : <Button onClick={onScreenshot}>Take screenshot</Button>
                        }
                      </Fragment>
                    )
                  }
                </Fragment>
              ) : <Spinner />
            }
          </Flex>
        ) : null
      }
      {
        src ? <Image src={src} alt="Preview image" /> : <Text>Could not load image.</Text>
      }
    </Flex>
  )
}

export default ImagePreview