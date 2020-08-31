import { Formik, Form } from 'formik'
import { Box, Button } from 'theme-ui'

import * as Widgets from '../../../widgets'

import {
  createInitialValues,
  createValidationSchema
} from "../../../forms";

import WidgetFormField from './Field'

import { Flex, Col } from './Flex'
import { useEffect, memo } from 'react';

const WidgetForm = ({
  apiId,
  formId,
  initialModelValues,
  onUpdateField,
  fieldType,
  onChange = () => {},
  Model
}) => {

  const { type } = initialModelValues
  const { FormFields } = Widgets[type]
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
        {({ errors, values: { label, id }, touched, isSubmitting }) => {
          useEffect(() => {
            onChange({ label, id })
          }, [label, id])
          return (
            <Form id={formId}>
              <Flex>
                {
                  Object.entries(FormFields).map(([key, field]) => (
                    <Col key={key}>
                      <WidgetFormField
                        fieldName={key}
                        fieldType={fieldType}
                        formField={field}
                        Model={Model}
                        initialValues={initialValues}
                      />
                    </Col>
                  ))
                }
              </Flex>
              <code>{JSON.stringify(errors)}</code>
            </Form>
          )}
        }
      </Formik>
    </Box>
  )
}

export default memo(WidgetForm)