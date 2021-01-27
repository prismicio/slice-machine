import { Box, Heading, Select, Label } from 'theme-ui'
import { useFormikContext } from 'formik'

import { initialValues } from './'

import { MockConfigKey } from 'src/consts'

const Form = () => {
  const { values, setFieldValue } = useFormikContext()

  const contentValue = values[MockConfigKey]?.content !== null ? values[MockConfigKey].content : null
  
  const onSelect = (e) => {
    setFieldValue(MockConfigKey, {
      content: e.target.value === 'true'
    })
  }

  return (
    <Box>
      <Label sx={{ display: 'block' }}>
        <Heading as="h3" mb={2} sx={{ display: 'block' }}>
          Boolean value
        </Heading>
        <Select onChange={onSelect} value={contentValue !== null ? contentValue.toString() : 'true'}>
          <option>true</option>
          <option>false</option>
        </Select>
      </Label>
    </Box>
  )
}

Form.initialValues = initialValues

export const MockConfigForm = Form