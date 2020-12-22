import { useState, useEffect } from 'react'
import { useFormikContext } from 'formik'

import { FormFieldCheckbox } from './'

const CheckboxControl = ({
  field,
  helpers,
  label,
  defaultValue,
  onChange,
  controllerField,
  setControlFromField
}) => {
  const { values: { [controllerField]: fieldControl }} = useFormikContext()
  const [isChecked, setCheck] = useState(defaultValue || field.defaultValue || false)

  useEffect(() => {
    helpers.setValue(setControlFromField ? setControlFromField(fieldControl, isChecked) : fieldControl)
  }, [isChecked, fieldControl])

  return (
    <FormFieldCheckbox
      meta={{
        value: isChecked
      }}
      fieldName={field.name}
      onChange={value => setCheck(value) && onChange && onChange(value)}
      label={typeof label === 'function' ? label(fieldControl, isChecked) : label}
    />
  )
}

export default CheckboxControl
