import { Input } from './fields'
import { VariationAsArr, WidgetsArea } from '../models/Variation';

export const validateId = ({
  value,
  variation,
  fieldType,
  initialValues
}: {
  value: string,
  variation: VariationAsArr,
  fieldType: WidgetsArea,
  initialValues: { id: string }
}) => {
  const fieldExists = VariationAsArr.getWidgetArea(variation, fieldType)?.find(e => e.key === value)
  if (fieldExists && value !== initialValues.id) {
    return `Field "${value}" already exists.`
  }
}

export const DefaultFields: any = {
  label: Input('Label', { required: false, max: true }),
  id: Input('API ID*', {
    min: true,
    max: true,
    required: true,
    matches: [/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/, 'No special characters allowed']
  }, validateId),
  placeholder: Input('Placeholder', { required: false, max: true })
}