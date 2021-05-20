import * as yup from 'yup'
import Select from 'react-select'
import { useContext } from 'react'
import { Label, Box } from 'theme-ui'

import { CustomTypesContext } from "src/models/customTypes/context"

import { DefaultFields } from 'lib/forms/defaults'

import WidgetFormField from 'lib/builders/common/EditModal/Field'

import { Col, Flex as FlexGrid } from 'components/Flex'

interface FormValues {
  id: string,
  label: string,
  select: string,
  customtypes: [string]
}

const FormFields = {
  id: DefaultFields.id,
  label: DefaultFields.label,
  customtypes: {
    validate: () => yup.array().of(yup.string())
  }
}

const WidgetForm = ({
  initialValues,
  values: formValues,
  fields,
  setFieldValue
}: {
  initialValues: FormValues,
  values: FormValues,
  fields: any,
  setFieldValue: Function
}) => {
  const { customTypes } = useContext(CustomTypesContext)

  // const { errors, Model, fieldType } = rest

  const options = customTypes.map(ct => ({ value: ct?.id, label: ct?.label }))
  const selectValues = formValues.customtypes.map((id: string) => {
    const ct = customTypes.find(e => e && e.id === id)
    return { value: ct?.id, label: ct?.label }
  })

  return (
    <FlexGrid>
      {
        Object.entries(FormFields).filter(e => e[0] !== 'customtypes').map(([key, field]) => (
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
      <Col>
        <Box
          sx={{
            mt: 2,
            alignItems: 'center',
          }}
        >
          <Label htmlFor="origin" mb="1">Custom Types</Label>
          <Select
            isMulti
            name="origin"
            options={options}
            onChange={(v: [{ value: string, label: string }] | null) => {
              if (v) {
                setFieldValue('customtypes', v.map(({ value }) => value))
              }
            }}
            value={selectValues}
            theme={(theme) => {
              return {
              ...theme,
              colors: {
              ...theme.colors,
                text: 'text',
                primary: 'background',
              },
            }}}
          />
        </Box>
      </Col>
    </FlexGrid>
  )
}

export { FormFields }

export default WidgetForm