import { Box, Heading, Label, Input } from 'theme-ui'
import { useFormikContext } from 'formik'

import { initialValues } from './'

import { MockConfigKey } from 'src/consts'

const Form = () => {
  const { values, setFieldValue } = useFormikContext()

  const contentValue = values[MockConfigKey]?.content || null
  
  const onUpdate = (value) => {
    setFieldValue(MockConfigKey, {
      content: value
    })
  }

  return (
    <Box>
      <Label sx={{ display: 'block' }}>
        <Heading as="h3" mb={0}>
          KeyText Mock
        </Heading>
        <Input
          sx={{ mt: 2, bg: 'headSection' }}
          value={contentValue}
          placeholder = "Dis-moi gros gras grand grain d'orge"
          onChange={e => onUpdate(e.target.value)}
        />
      </Label>
    </Box>
  )
}

Form.initialValues = initialValues

export const MockConfigForm = Form