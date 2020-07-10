import { Fragment } from 'react'

import {
  Field,
  useField,
} from 'formik'

import MultiSelect from '@khanacademy/react-multi-select'

import * as FormTypes from '../../../forms/types'

import {
  Box,
  Label,
  Input,
  Checkbox
} from 'theme-ui'

const WidgetFormField = ({ 
  fieldName,
  formField,
  fieldType,
  Model,
  initialValues
}) => {
  const [field, meta, helpers] = useField(fieldName);
  return (
    <Box mt={2}>
      {formField.type === FormTypes.INPUT && (
        <Fragment>
          <Label>{formField.label || fieldName}</Label>
          <Field
            name={fieldName}
            id={fieldName}
            type="text"
            placeholder={formField.placeholder || formField.label || fieldName}
            {
              ...(formField.fieldLevelValidation ? {
                validate: (value) => formField.fieldLevelValidation({
                  value,
                  Model,
                  fieldName,
                  fieldType,
                  initialValues
                })
              } : null)
            }
            as={Input}
            {...field}
          />
        </Fragment>
      )}
      {formField.type === FormTypes.CHECKBOX && (
        <Label>
          <Field
            as={Checkbox}
            type="checkbox"
            name={fieldName}
            onChange={() => helpers.setValue(!meta.value)}
            checked={meta.value}
          />
          {formField.label}
        </Label>
      )}
      {formField.type === FormTypes.SELECT && (
        <Fragment>
          <Label>{formField.label || fieldName}</Label>
          <MultiSelect
            options={formField.options}
            selected={meta.value}
            onSelectedChanged={(selected) => helpers.setValue(selected)}
            {...field}
          />
        </Fragment>
      )}
    </Box>
  ); 
}

export default WidgetFormField