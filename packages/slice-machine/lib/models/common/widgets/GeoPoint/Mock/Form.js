import { useState } from 'react'
import equal from 'fast-deep-equal'
import { Box, Label, Card, Input, Text } from 'theme-ui'
import { useFormikContext } from 'formik'

import { initialValues } from '.'

import { MockConfigKey } from 'lib/consts'

import InputDeleteIcon from 'components/InputDeleteIcon'
import PreviewCard from 'components/Card/Preview'

import places from './places'

const createMapsUrl = (points) => `https://google.com/maps/@${points.latitude},${points.longitude}`

const InputSrc = ({ contentValue, value, onUpdate, onDelete }) => {
  return (
    <Label variant="label.primary" sx={{ display: 'block' }}>
      <Text as="span">Google Maps Url</Text>
      <Input
        value={value}
        placeholder="https://maps.google.com/@..."
        onChange={e => onUpdate(e.target.value)}
      />
      <InputDeleteIcon onClick={onDelete}/>
      {
        contentValue ? (
          <Box sx={{ position: 'absolute', top: '34px', right: '38px', color: 'textClear' }}>
            <span>lat: {contentValue.latitude}</span>&nbsp;&nbsp;<span>long: {contentValue.longitude}</span>
          </Box>
        ) : null
      }
    </Label>
  )
}

const Form = () => {
  const { values, setFieldValue } = useFormikContext()

  const contentValue = values[MockConfigKey]?.content || null
  const [url, setUrl] = useState(contentValue ? createMapsUrl(contentValue) : '')
  
  const onUpdate = (points) => {
  setUrl(createMapsUrl(points))
    setFieldValue(MockConfigKey, {
      content: points
    })
  }

  const parseMapUrl = (url) => {
    setUrl(url)
    if (!url) {
      return
    }
    const res = url.match(/@(.*),(.*),/)
    if (res && res.length === 3) {
      onUpdate({
        latitude: parseFloat(res[1]),
        longitude: parseFloat(res[2])
      })
    }
  }

  const onDelete = () => {
    setUrl('')
    setFieldValue(MockConfigKey, {})
  }

  return (
    <Box>
      <InputSrc contentValue={contentValue} value={url} onUpdate={parseMapUrl} onDelete={onDelete} />
      <Label variant="label.primary" mt={3} mb={2} htmlFor="places">
        Presets
      </Label>
      <Box sx={{ display: 'grid', gridColumnGap: '8px', gridTemplateColumns: '1fr 1fr' }}>
        {
          places.map(place => (
            <PreviewCard
              key={place.name}
              title={place.name}
              imageUrl={place.imageUrl}
              selected={equal(place.points, contentValue)}
              titleSx={{
                fontSize: 2,
                maxWidth: '80%'
              }}
              sx={{
                mb: 3
              }}
              onClick={() => onUpdate(place.points)}
            />
          ))
        }
      </Box>
    </Box>
  )
}

Form.initialValues = initialValues

export const MockConfigForm = Form