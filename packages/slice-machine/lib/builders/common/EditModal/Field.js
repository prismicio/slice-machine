import { Fragment } from 'react'

import { useField } from 'formik'

import { FormFieldCheckbox, FormFieldInput } from '../../../../components/FormFields'

import { FormTypes } from '../../../forms/types'

import { Box } from 'theme-ui'

const WidgetFormField = ({
  fieldName,
  formField,
  fields,
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
          initialValues={initialValues}
        />
      ) : (
        <Fragment>
          {formField.type === FormTypes.INPUT ? (
            <FormFieldInput
              meta={meta}
              field={field}
              fields={fields}
              formField={formField}
              fieldName={fieldName}
              initialValues={initialValues}
            />
          ) : null}
          {formField.type === FormTypes.CHECKBOX && (
            <FormFieldCheckbox
              meta={meta}
              label={formField.label}
              fieldName={fieldName}
              initialValues={initialValues}
              onChange={value => helpers.setValue(value)}

            />
          )}
        </Fragment>
      )}
    </Box>
  );
}

export default WidgetFormField