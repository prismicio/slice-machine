import { Formik, Field, Form } from 'formik'
import {
  Box,
  Heading,
  Text,
  Button,
  Label,
  Input,
  Radio
} from 'theme-ui'

import * as Widgets from '../../../widgets'
import {
  DefaultFields,
  validateId
} from '../../../forms/defaults'
import {
  createInitialValues,
  createValidationSchema
} from '../../../forms'

const RadioGroup = ({
  name,
  value,
  setFieldValue
}) => console.log({ name, value }) || (
  <Box>
    <Label>
      In primary or repeatable
    </Label>
    <Label>
      <Radio
        name={name}
        value={value === 'primary'}
        defaultChecked={true}
        onChange={() => setFieldValue(name, 'primary')}
      />
      Primary
    </Label>
    <Label>
      <Radio
        name={name}
        value={value === 'items'}
        onChange={() => setFieldValue(name, 'items')}
      />
      Repeatable
    </Label>
  </Box>
)

const FieldAdder = ({
  widget,
  Model,
  onSave,
}) => {
  const { create, Meta } = widget

  const FormFields = {
    id: DefaultFields.id
  }
  const initialValues = {
    ...createInitialValues(FormFields),
    fieldType: 'primary'
  }
  const validationSchema = createValidationSchema(FormFields)
  return (
    <Formik
      validateOnChange
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSave}
     >
       {({ values, errors, setFieldValue }) => (
        <Form>
          <Box
            my={2}
            bg="muted"
          >
            <Heading>{Meta.title}</Heading>
            <Text as="p">{Meta.description}</Text>
            <Box>
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
                    fieldType: values.fieldType,
                    initialValues: { id: null }
                  })
                }
                as={Input}
              />
              <RadioGroup
                name="fieldType"
                value={values.fieldType}
                setFieldValue={setFieldValue}
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

const FieldAdders = ({ Model }) => {
  return Object.entries(Widgets).map(([name, widget]) => {
    const { Meta } = widget
    const onSave = (values) => {
      console.log({ values })
    }
    if (Meta) { // prov
      return <FieldAdder key={name} widget={widget} Model={Model} onSave={onSave}/>
    }
    return null
  })
}

export default FieldAdders