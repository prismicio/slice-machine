import { useEffect, useState, useRef, Fragment } from 'react'
import { Label, Flex, Image, Button, Text, Spinner } from 'theme-ui'
import { acceptedImagesTypes } from 'src/consts'

const ImagePreview = ({
  src,
  onScreenshot,
  isCustomPreview,
  imageLoading,
  onHandleFile,
  preventScreenshot
}) => {
  const inputFile = useRef(null)
  const [display, setDisplay] = useState(false)
  const [preserveDisplay, setPreserveDisplay] = useState(false)
  const handleMouseHover = (state) => setDisplay(state)

  const handleFile = () => {
    if (inputFile.current && inputFile.current.files) {
      const reader = new FileReader()
      reader.onload = function(ev) {
        onHandleFile(ev.target.result)
      }
      reader.readAsDataURL(inputFile.current.files[0])
    }
  }

  useEffect(() => setPreserveDisplay(false), [src])

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
        (display || preserveDisplay || imageLoading) ? (
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
              display || preserveDisplay ? (
                <Fragment>
                  <Flex sx={{ flexDirection: 'column' }}>
                        <Button sx={{ mb: 3 }} variant={preventScreenshot ? 'disabled' : 'primary'} disabled={preventScreenshot} onClick={onScreenshot}>Take screenshot</Button>
                        <Label
                          htmlFor="input-file"
                          variant="buttons.primary"
                          sx={{ p: 2, borderRadius: '4px' }}
                        >
                          Custom screenshot
                        </Label>
                        <input
                          onClick={() => setPreserveDisplay(true)}
                          id="input-file"
                          type="file"
                          ref={inputFile}
                          style={{ display: 'none' }}
                          accept={acceptedImagesTypes.map(type => `image/${type}`).join(',')}
                          onChange={() => handleFile(inputFile)}
                        />
                      </Flex>
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