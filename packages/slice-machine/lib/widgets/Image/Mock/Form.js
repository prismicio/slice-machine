import { Fragment, useState } from 'react'
import { Box, Heading, Text, useThemeUI, Button, Flex, Label, Input } from 'theme-ui'
import { FaRegQuestionCircle } from 'react-icons/fa'
import { useFormikContext } from 'formik'

import { initialValues, images } from './'

import WindowPortal from 'components/WindowPortal'
import { Flex as FlexGrid, Col } from 'components/Flex'

import { MockConfigKey } from 'src/consts'

import * as dataset from './dataset'

import { ImagesListCards, ImagesList } from './components'

const ImageSelection = ({ value, onUpdate }) => {
  const [imagesSet, setImagesSet] = useState({ images: null, name: null })
 
  const onChange = (e) => {
    e.preventDefault()
    onUpdate(e.target.src)
    setImagesSet({ images: null, name: null })
  }

  const onSelect = (set) => {
    setImagesSet({ images: dataset[set], name: set })
  }

  return (
    <Box>
      <ImagesListCards onSelect={onSelect} />
      {
        imagesSet.images ? (
          <WindowPortal onClose={() => setImagesSet({ images: null, name: null })}>
            <ImagesList listName={imagesSet.name} images={imagesSet.images} value={value} onChange={onChange} />
          </WindowPortal>
        ) : null
      }
    </Box>
  )
}

const InputSrc = ({ value, onUpdate }) => {
  const { theme } = useThemeUI()
  const [displayMore, setDisplayMore] = useState(false)

  return (
    <Box>
      <Heading as="h3" mb={0}>
        Prismic or Unsplash url
        <FaRegQuestionCircle
          data-for="question-circle"
          color={theme.colors.icons}
          onClick={() => setDisplayMore(!displayMore)}
          style={{
            position: 'relative',
            cursor: 'pointer',
            top: '3px',
            height: '18px', 
            marginLeft: '8px'
          }}
        />
      </Heading>
      {
        displayMore ? (
          <Box
            variant="plain"
            sx={{
              p: 2,
              my: 2,
              border: '1px solid',
              borderColor: 'borders',
              bg: 'headSection'
            }}
          >
            <Heading as="h4">More info</Heading>
            <Text as="p" mt={1} mb={1}>
              In order for Prismic to properly display images, they need to be provided by Imgix.
            </Text>
          </Box>
        ) : null
      }
      <Input
        sx={{ mt: 2, bg: 'headSection' }}
        value={value}
        placeholder="https://images.prismic.io/..."
        onChange={e => onUpdate(e.target.value)}
      />
    </Box>
  )
}

const Form = () => {
  const { values, setFieldValue } = useFormikContext()

  const contentValue = values[MockConfigKey]?.content || null
  
  const onUpdate = (value) => {
    const clean = value.split('?')[0]
    setFieldValue(MockConfigKey, {
      content: clean
    })
  }

  return (
    <Box>
      <InputSrc value={contentValue} onUpdate={onUpdate} />
      <Box mt={3}>
        <ImageSelection value={contentValue} onUpdate={onUpdate} />
      </Box>
    </Box>
  )
}

Form.initialValues = initialValues

export const MockConfigForm = Form