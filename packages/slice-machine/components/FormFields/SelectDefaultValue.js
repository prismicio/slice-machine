import { useState, useEffect } from 'react'
import { useFormikContext } from 'formik'

import { FormFieldCheckbox } from './'

const SelectDefaultValue = ({ field, meta, helpers }) => {
  const [isChecked, setCheck] = useState(field.defaultValue || false)
  const { values: { options }} = useFormikContext()

  useEffect(() => {
    if (isChecked && options.length) {
      helpers.setValue(options[0])
    } else {
      helpers.setValue('')
    }
  }, [isChecked])

  useEffect(() => {
    if (isChecked) {
      helpers.setValue(options[0])
    }
  }, [options])

  return (
    <FormFieldCheckbox
      meta={meta}
      onChange={setCheck}
      label={`use first value as default ${options.length ? `("${options[0]}")` : ''}`}
    />
  )
}

export default SelectDefaultValue
