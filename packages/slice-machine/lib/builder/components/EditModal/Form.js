import { Formik } from 'formik'
import { Box } from 'theme-ui'

import * as Widgets from '../../../widgets'

import {
  createInitialValues,
  createValidationSchema
} from "../../../forms";

import { memo } from 'react';

const WidgetForm = ({
  apiId,
  initialModelValues,
  onUpdateField,
  children,
}) => {

  const { type } = initialModelValues
  const { FormFields, Form: CustomForm } = Widgets[type]
  if (!FormFields) {
    return (<div>{type} not supported yet</div>)
  }

  const initialValues = {
    ...createInitialValues(FormFields),
    ...initialModelValues.config,
    id: apiId
  }
  const validationSchema = createValidationSchema(FormFields)

  return (
    <Box>
      <Formik
        validateOnChange
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, _) => {
          const { id: apiId,  ...rest } = values
          const withDefaultValues = Object.entries(rest).reduce((acc, [key, value]) => {
            if (typeof value !== Boolean && !value) {
              const maybeDefaultValue = FormFields[key].defaultValue
              if (maybeDefaultValue !== undefined) {
                return {
                  ...acc,
                  [key]: maybeDefaultValue
                }
              }
            }
            return {
              ...acc,
              [key]: value
            }
          }, {})
          onUpdateField(apiId, withDefaultValues)
        }}
      >
        {props => children({
          ...props,
          FormFields,
          initialValues,
          CustomForm
        })}
      </Formik>
    </Box>
  )
}

export default memo(WidgetForm)