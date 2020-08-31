import { Field } from 'formik'
import { Label, Checkbox } from 'theme-ui'

const FormFieldCheckbox = ({
  meta,
  label,
  fieldName,
  onChange,
  ...rest
}) => {
  return (
    <Label variant="label.border" {...rest}>
      <Field
        as={Checkbox}
        type="checkbox"
        name={fieldName}
        onChange={() => onChange(!meta.value)}
        checked={meta.value}
      />
      {label}
    </Label>
  )
}

export default FormFieldCheckbox