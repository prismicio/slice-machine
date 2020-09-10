import { useEffect, useRef } from 'react'
import { Formik, Form, Field } from 'formik'
import { Input, Flex, Text, Button, Label } from 'theme-ui'

import {
  DefaultFields,
  validateId
} from 'lib/forms/defaults'
import {
  createInitialValues,
  createValidationSchema
} from 'lib/forms'

import * as Widgets from 'lib/widgets'


import ErrorTooltip from './ErrorTooltip'

const NewField = ({
  fieldType,
  zone,
  onSave,
  variation
}) => {

  const fieldRef = useRef(null)
  const widget = Widgets[fieldType]
  if (!widget) {
    console.error(`Widget of type "${fieldType}" not found. This is a problem on our side!`)
    return <div>Unexpected error. Contact us for more info.</div>
  }
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
      onSubmit={onSave}
      validationSchema={validationSchema}
      initialValues={initialValues}
     >
       {({ values, errors }) => (
        <Form>
          <Flex
            as="li"
            sx={{
              py: 2,
              px: 3,
              mx: 3,
              alignItems: "center",
              variant: "styles.listItem",
            }}
          >
            <Flex
              sx={{
                alignItems: "center",
              }}
            >
              <Label
                sx={{
                  display: 'flex',
                  alignItems: "center",
                }}
              >
                <Text as="p" sx={{ mr: 3, minWidth: '56px' }}>
                field id
                </Text>
                <Field
                  name="id"
                  placeholder="myField"
                  type="text"
                  validate={
                    (value) => validateId({
                      value,
                      variation,
                      fieldName: 'id',
                      fieldType: zone,
                      initialValues: { id: null }
                    })
                  }
                  as={Input}
                  innerRef={fieldRef}
                  sx={{ 
                    border: ({ colors }) => errors.id ? `1px solid tomato` : `1px solid ${colors.primary}`,
                    '&:focus': {
                      border: errors.id ? `1px solid tomato` : '1px solid yellow'
                    }
                  }}
                />
                <ErrorTooltip errors={errors} />
              </Label>
            </Flex>
            <Button type="submit">Add</Button>
          </Flex>
        </Form>
       )}
    </Formik>
  )
}

export default NewField