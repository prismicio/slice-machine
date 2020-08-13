import { Fragment } from 'react'

import {
  Field,
  useField,
} from 'formik'

import MultiSelect from '@khanacademy/react-multi-select'

import { FormFieldCheckbox } from 'components/FormFields'

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
  const MaybeCustomComponent = formField.component
  return (
    <Box mt={2}>
      {MaybeCustomComponent && (
        <MaybeCustomComponent
          meta={meta}
          field={field}
          helpers={helpers}
          fieldName={fieldName}
          formField={formField}
        />
      )}
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
        <FormFieldCheckbox
          meta={meta}
          label={formField.label}
          fieldName={fieldName}
          onChange={value => helpers.setValue(value)}
        
        />
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