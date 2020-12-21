import { DefaultFields } from 'lib/forms/defaults'


import WidgetFormField from 'lib/builder/modules/EditModal/Field'

import { Col, Flex as FlexGrid } from 'components/Flex'

const FormFields = { ...DefaultFields }

const Form = (props) => {
  const {
    initialValues,
    values: formValues,
    errors,
    Model,
    variation,
    fieldType,
    touched
  } = props
  
  const { thumbnails, constraint } = formValues

  return (
    <FlexGrid>
      {
        Object.entries(FormFields).map(([key, field]) => (
          <Col key={key}>
            <WidgetFormField
              fieldName={key}
              fieldType={fieldType}
              Model={Model}
              formField={field}
              variation={variation}
              initialValues={initialValues}
            />
          </Col>
        ))
      }
    </FlexGrid>
  )
}

export { FormFields }
export default Form