import { useState } from 'react'
import { Flex, Image, Button, Text, Spinner } from 'theme-ui'

const ImagePreview = ({ src, onScreenshot, imageLoading }) => {
  const [display, setDisplay] = useState(false)
  const handleMouseHover = (state) => setDisplay(state)

  return (
    <Flex
      sx={{
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: src ? '220px': '120px',
        bg: '#f1f1f1'
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
                <Button onClick={onScreenshot}>Take screenshot</Button>
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