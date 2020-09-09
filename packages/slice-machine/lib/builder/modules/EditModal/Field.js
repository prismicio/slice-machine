import { Fragment } from 'react'

import {
  useField,
} from 'formik'

import MultiSelect from '@khanacademy/react-multi-select'

import { FormFieldCheckbox, FormFieldInput } from 'components/FormFields'

import * as FormTypes from '../../../forms/types'

import {
  Box,
  Label,
} from 'theme-ui'

const WidgetFormField = ({ 
  fieldName,
  formField,
  fieldType,
  variation,
  initialValues
}) => {
  const [field, meta, helpers] = useField(fieldName)
  const MaybeCustomComponent = formField.component

  return (
    <Box
      sx={{
        mt: 2,
        alignItems: 'center',
        ...(formField.type === FormTypes.CHECKBOX ? {
          display: 'flex',
          height: '130%'
        } : null)
      }}
    >
      { MaybeCustomComponent ? (
        <MaybeCustomComponent
          meta={meta}
          field={field}
          helpers={helpers}
          fieldName={fieldName}
          formField={formField}
        />
      ) : (
        <Fragment>
          {formField.type === FormTypes.INPUT ? (
            <FormFieldInput
              variation={variation}
              field={field}
              meta={meta}
              formField={formField}
              fieldName={fieldName}
              fieldType={fieldType}
              initialValues={initialValues}
            />
          ) : null}
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
        </Fragment>
      )}
    </Box>
  ); 
}

export default WidgetFormField