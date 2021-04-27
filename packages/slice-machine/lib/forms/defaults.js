import { Input } from './fields'

export const validateId = ({
  value,
  variation,
  // fieldName,
  fieldType,
  initialValues
}) => {
  const fieldExists = variation[fieldType].find(e => e.key === value)
  if (fieldExists && value !== initialValues.id) {
    return `Field "${value}" already exists.`
  }
}

export const DefaultFields = {
  label: Input('Label', { required: false, max: true }),
  id: Input('API ID*', {
    min: true,
    max: true,
    required: true,
    matches: [/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/, 'No special characters allowed']
  }, validateId),
  placeholder: Input('Placeholder', { required: false, max: true })
}