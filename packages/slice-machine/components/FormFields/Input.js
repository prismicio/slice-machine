import { Box, Label, Input, Text } from 'theme-ui'

const FormFieldInput = ({
  sx = {},
  variation,
  field,
  meta = {},
  formField,
  fieldName,
  fieldType,
  initialValues
}) => (
  <Box sx={sx}>
    <Label
      variant="label.primary"
      htmlFor={fieldName}
    >
      {formField.label || fieldName}
      {
        meta.touched && meta.error ? (
          <Text as="span" variant="text.labelError">{meta.error}</Text>
        ) : null
      }
    </Label>
    <Input
      name={fieldName}
      id={fieldName}
      type="text"
      placeholder={formField.placeholder || formField.label || fieldName}
      {
        ...(formField.fieldLevelValidation ? {
          validate: (value) => formField.fieldLevelValidation({
            value,
            variation,
            fieldName,
            fieldType,
            initialValues
          })
        } : null)
      }
      {...field}
    />
  </Box>
)

export default FormFieldInput