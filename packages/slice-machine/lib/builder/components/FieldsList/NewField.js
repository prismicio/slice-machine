import { useEffect, useRef } from 'react'
import { Formik, Form, Field } from 'formik'
import { Input, Heading, Text, Button, Box, Label } from 'theme-ui'

import {
  DefaultFields,
  validateId
} from '../../../forms/defaults'
import {
  createInitialValues,
  createValidationSchema
} from '../../../forms'

import * as Widgets from '../../../widgets'

const NewField = ({
  fieldType,
  zone,
  onSave,
  Model
}) => {

  const fieldRef = useRef(null)
  const widget = Widgets[fieldType]
  if (!widget) {
    console.error(`Widget of type "${fieldType}" not found. This is a problem on our side!`)
    return <div>Unexpected error. Contact us for more info.</div>
  }
  const { Meta } = widget
  const FormFields = {
    id: DefaultFields.id
  }
  const initialValues = {
    ...createInitialValues(FormFields),
    fieldType
  }
  const validationSchema = createValidationSchema(FormFields)

  useEffect(() => {
    if (fieldRef.current) {
      fieldRef.current.focus()
    }
  }, [fieldRef])
  return (
    <Formik
      validateOnChange
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSave}
     >
       {({ values, errors }) => (
        <Form>
          <Box
            my={2}
            bg="muted"
          >
            <Heading>{Meta.title}</Heading>
            <Text as="p">{Meta.description}</Text>
            <Box style={{ border: errors.id ? '1px solid tomato' : '1px solid transparent'}}>
              <Label htmlFor="id">API ID</Label>
              <Field
                name="id"
                placeholder="myField"
                type="text"
                validate = {
                  (value) => validateId({
                    value,
                    Model,
                    fieldName: 'id',
                    fieldType: zone,
                    initialValues: { id: null }
                  })
                }
                as={Input}
                innerRef={fieldRef}
              />
              {JSON.stringify({ values, errors })}
              <Button type="submit">Add</Button>
            </Box>
          </Box>
        </Form>
       )}
    </Formik>
  )
}

export default NewField