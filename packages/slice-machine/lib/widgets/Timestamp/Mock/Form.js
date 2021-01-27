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
        Not ready
      </Label>
    </Box>
  )
}

Form.initialValues = initialValues

export const MockConfigForm = Form