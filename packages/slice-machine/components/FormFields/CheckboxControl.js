import { useState, useEffect } from 'react'
import { useFormikContext } from 'formik'

import { FormFieldCheckbox } from './'

const CheckboxControl = ({
  field,
  meta,
  helpers,
  fieldName,
  emptyVal = '',
  label,
  defaultValue,
  onChange,
  setControlFromField
}) => {
  const { values: { [fieldName]: fieldControl }} = useFormikContext()
  const [isChecked, setCheck] = useState(defaultValue || field.defaultValue || false)

  useEffect(() => {
    if (isChecked && fieldControl) {
      helpers.setValue(setControlFromField ? setControlFromField(fieldControl, isChecked) : fieldControl)
    } else {
      helpers.setValue('')
    }
  }, [isChecked])

  useEffect(() => {
    if (isChecked) {
      helpers.setValue(setControlFromField ? setControlFromField(isChecked) : fieldControl)
    }
  }, [fieldControl])

  return (
    <FormFieldCheckbox
      meta={meta}
      onChange={value => setCheck(value) && onChange && onChange(value)}
      label={typeof label === 'function' ? label(fieldControl, isChecked) : label}
    />
  )
}

export default CheckboxControl
