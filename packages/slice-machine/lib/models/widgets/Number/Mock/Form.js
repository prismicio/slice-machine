import { Box, Text, Label, Input } from 'theme-ui'
import { useFormikContext } from 'formik'
import InputDeleteIcon from 'components/InputDeleteIcon'

import { initialValues } from '.'

import { MockConfigKey } from 'src/consts'

const Form = () => {
  const { values, setFieldValue } = useFormikContext()

  const contentValue = values[MockConfigKey]?.content
  
  const onUpdate = (value) => {
    if (!value || !value.length) {
      return setFieldValue(MockConfigKey, {})
    }
    setFieldValue(MockConfigKey, {
      content: parseInt(value)
    })
  }

  const onDelete = () => {
    setFieldValue(MockConfigKey, {})
  }

  return (
    <Box>
      <Label variant="label.primary" sx={{ display: 'block', maxWidth: '400px' }}>
        <Text as="span">Number value</Text>
        <Input
          value={contentValue || ''}
          placeholder = "1995"
          type="number"
          onChange={e => onUpdate(e.target.value)}
          sx={{
            '-moz-appearance': 'textField',
            '&::-webkit-outer-spin-button,&::-webkit-inner-spin-button': {
              '-webkit-appearance': 'none',
              'margin': 0
            }
          }}
        />
        <InputDeleteIcon onClick={onDelete}/>
      </Label>
    </Box>
  )
}

Form.initialValues = initialValues

export const MockConfigForm = Form