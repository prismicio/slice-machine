import { Box, Heading, Label } from 'theme-ui'
import { useFormikContext } from 'formik'
import { BlockPicker } from 'react-color'

import { initialValues } from './'

import { MockConfigKey } from 'src/consts'

const Form = () => {
  const { values, setFieldValue } = useFormikContext()

  const contentValue = values[MockConfigKey]?.content || null
  
  const onChange = (color) => {
    setFieldValue(MockConfigKey, {
      content: color.hex
    })
  }

  return (
    <Box>
      <Label sx={{ display: 'block' }}>
        <Heading as="h3" mb={3} sx={{ display: 'block' }}>
          Color value
        </Heading>
        <BlockPicker color={contentValue || initialValues.content} onChangeComplete={onChange} />
      </Label>
    </Box>
  )
}

Form.initialValues = initialValues

export const MockConfigForm = Form