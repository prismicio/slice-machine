import { Box, Text, Select, Label } from 'theme-ui'
import { useFormikContext } from 'formik'

import { initialValues } from './'

import { MockConfigKey } from 'src/consts'

const RAND = 'RANDOM'

const Form = () => {
  const { values, setFieldValue } = useFormikContext()
  const contentValue = values[MockConfigKey]?.content
  
  const onSelect = (e) => {
    if (e.target.value === RAND) {
      return setFieldValue(MockConfigKey, {})
    }
    setFieldValue(MockConfigKey, {
      content: e.target.value === (values.placeholder_true || 'true')
    })
  }

  const value = (() => {
    if (contentValue != null) {
      return contentValue === true
        ? values.placeholder_true || 'true'
        : values.placeholder_false || 'false'
    }
    return RAND
  })()

  return (
    <Box>
      <Label variant="label.primary" sx={{ display: 'block', maxWidth: '400px' }}>
        <Text as="p" mb={1}>Boolean value</Text>
        <Select onChange={onSelect} value={value}>
          <option value={RAND}>Random</option>
          <option>{values.placeholder_true || 'true'}</option>
          <option>{values.placeholder_false || 'false'}</option>
        </Select>
      </Label>
    </Box>
  )
}

Form.initialValues = initialValues

export const MockConfigForm = Form