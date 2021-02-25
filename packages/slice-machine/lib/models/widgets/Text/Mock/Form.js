import { Box, Text, Label, Input } from 'theme-ui'
import { useFormikContext } from 'formik'
import InputDeleteIcon from 'components/InputDeleteIcon'

import { initialValues } from '.'

import { MockConfigKey } from 'src/consts'

const Form = () => {
  const { values, setFieldValue } = useFormikContext()

  const contentValue = values[MockConfigKey]?.content || null
  
  const onUpdate = (value) => {
    if (!value || !value.length) {
      return setFieldValue(MockConfigKey, {})
    }
    setFieldValue(MockConfigKey, {
      content: value
    })
  }

  const onDelete = () => {
    setFieldValue(MockConfigKey, {})
  }

  return (
    <Box>
      <Label variant="label.primary" sx={{ display: 'block', maxWidth: '400px' }}>
        <Text as="span">Text value</Text>
        <Input
          value={contentValue || ''}
          placeholder = "Something well put"
          onChange={e => onUpdate(e.target.value)}
        />
        <InputDeleteIcon onClick={onDelete}/>
      </Label>
    </Box>
  )
}

Form.initialValues = initialValues

export const MockConfigForm = Form