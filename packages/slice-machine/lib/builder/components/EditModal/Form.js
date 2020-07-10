import { Formik, Form } from 'formik'
import { Box, Button } from 'theme-ui'

import * as Widgets from '../../../widgets'

import {
  createInitialValues,
  createValidationSchema
} from "../../../forms";

import WidgetFormField from './Field'

const WidgetForm = ({
  apiId,
  initialModelValues,
  onUpdateField,
  fieldType,
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
    <Box mt={4}>
      <Formik
        validateOnChange
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, formikBag) => {
          const { id: apiId,  ...rest } = values
          onUpdateField(apiId, rest)
        }}
      >
        {({ errors, touched, isSubmitting }) => (
            <Form>
              {Object.entries(FormFields).map(([key, field]) => (
                <WidgetFormField
                  key={key}
                  fieldName={key}
                  fieldType={fieldType}
                  formField={field}
                  Model={Model}
                  initialValues={initialValues}
                />
              ))}
              <Button mt={2} type="submit" disabled={isSubmitting}>
                Submit
              </Button>
              <code>{JSON.stringify(errors)}</code>
            </Form>
          )
        }
      </Formik>
    </Box>
  )
}

export default WidgetForm