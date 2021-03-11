import { Input } from './fields'
import { Variation, AsArray, WidgetsArea } from '../models/common/Variation';

export const validateId = ({
  value,
  variation,
  fieldType,
  initialValues
}: {
  value: string,
  variation: Variation<AsArray>,
  fieldType: WidgetsArea,
  initialValues: { id: string }
}) => {
  const fieldExists = Variation.getWidgetArea(variation, fieldType)?.find(({key}) => key === value)
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