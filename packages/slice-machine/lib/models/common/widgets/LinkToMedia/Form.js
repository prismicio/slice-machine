import { DefaultFields } from '@lib/forms/defaults'

import WidgetFormField from '@lib/builders/common/EditModal/Field'

import { Col, Flex as FlexGrid } from 'components/Flex'
import { createFieldNameFromKey } from '@lib/forms'

const FormFields = { ...DefaultFields }

const Form = (props) => {
  const {
    initialValues,
    fields,
  } = props

  return (
    <FlexGrid>
      {
        Object.entries(FormFields).map(([key, field]) => (
          <Col key={key}>
            <WidgetFormField
              fieldName={createFieldNameFromKey(key)}
              formField={field}
              fields={fields}
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
