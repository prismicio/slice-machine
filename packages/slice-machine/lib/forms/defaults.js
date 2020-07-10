import * as FormTypes from './types'
import { Input } from './fields'

export const validateId = ({
  value,
  Model,
  fieldName,
  fieldType,
  initialValues
}) => {
  const fieldExists = Model[fieldType]()[value]
  console.log({ fieldType, fieldExists, value })
  if (fieldExists && value !== initialValues.id) {
    return `Field "${value}" already exists.`
  }
}

export const DefaultFields = {
  label: Input('Label'),
  id: Input('API ID', {
    min: true,
    max: true,
    required: true,
    matches: [/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/, 'Invalid characters. API id must be of type slug']
  }, validateId),
  placeholder: Input('Placholder', null)
}