import { Box, Text, Select, Label } from 'theme-ui'
import { useFormikContext } from 'formik'

import { initialValues } from '.'

import { MockConfigKey } from 'src/consts'

const RAND = 'Random'

const Form = () => {
  const { values, setFieldValue } = useFormikContext()

  const contentValue = values[MockConfigKey]?.content !== null ? values[MockConfigKey].content : null
  
  const onSelect = (e) => {
    if (e.target.value === RAND) {
      return setFieldValue(MockConfigKey, {})
    }
    setFieldValue(MockConfigKey, {
      content: e.target.value
    })
  }

  const options = [
    RAND,
    ...values.options
  ]

  return (
    <Box>
      <Label sx={{ display: 'block', maxWidth: '400px' }}>
        <Text as="p" mb={1}>Select value</Text>
        <Select onChange={onSelect} value={contentValue || RAND}>
          {
            options.map(o => <option key={o}>{o}</option>)
          }
        </Select>
      </Label>
    </Box>
  )
}

Form.initialValues = initialValues

export const MockConfigForm = Form