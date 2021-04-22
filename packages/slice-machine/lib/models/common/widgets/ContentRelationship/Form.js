import { useEffect, useState } from 'react'
import * as yup from 'yup'
import { CheckBox as CheckBoxConstructor } from 'lib/forms/fields'
import { DefaultFields } from 'lib/forms/defaults'

import WidgetFormField from 'lib/builders/common/EditModal/Field'

import { Text, Button, Label, Checkbox, Flex, Box } from 'theme-ui'
import { Col, Flex as FlexGrid } from 'components/Flex'
import IconButton from 'components/IconButton'

const FormFields = {
  id: DefaultFields.id,
  label: DefaultFields.label,
}

const WidgetForm = (props) => {
  const { initialValues, values: formValues, errors, Model, fields, fieldType, setFieldValue, } = props
  // const { single, multi } = formValues
  // const initialOptions = single ? _createInitialOptions(single)
  //   : (multi && _createInitialOptions(multi))
  //   || optionValues

  // const [isMulti, setIsMulti] = useState(single ? false : true)
  // const [acceptOptions, setAcceptOptions] = useState(initialOptions)

  // useEffect(() => {
  //   const fieldNameIndex = isMulti ? 1 : 0
  //   setFieldValue(accessors[fieldNameIndex], acceptOptions.join(','))
  //   setTimeout(() => { // prevent tests from failing for both values
  //     setFieldValue(accessors[1 - fieldNameIndex], undefined)
  //   }, 100)

  // }, [isMulti, acceptOptions])

  return (
    <FlexGrid>
      {
        Object.entries(FormFields).map(([key, field]) => (
          <Col key={key}>
            <WidgetFormField
              fieldName={key}
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

FormFields.customtypes = {
  validate: () => yup.array().of(yup.string())
}

export { FormFields }

export default WidgetForm