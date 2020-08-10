import { Input } from './fields'

export const validateId = ({
  value,
  Model,
  // fieldName,
  fieldType,
  initialValues
}) => {
  const fieldExists = Model[fieldType]().find(e => e.key === value)
  if (fieldExists && value !== initialValues.id) {
    return `Field "${value}" already exists.`
  }
}

export const DefaultFields = {
  label: Input('Label', { required: false }),
  id: Input('API ID*', {
    min: true,
    max: true,
    required: true,
    matches: [/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/, 'Invalid characters. API id must be of type slug']
  }, validateId),
  placeholder: Input('Placeholder', null)
}