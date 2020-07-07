import { Field, useField } from 'formik'
import MultiSelect from '@khanacademy/react-multi-select'

import { FormTypes } from '../../lib/mocker/FormHelpers'

import {
  Box,
  Label,
  Input,
  Checkbox
} from 'theme-ui'
import { Fragment } from 'react'

export default ({ fieldName, formField }) => {
  const [field, meta, helpers] = useField(fieldName);
  console.log({
    field,
    meta,
    helpers
  })
  return (
    <Box mt={2}>
      {formField.type === FormTypes.STRING && (
        <Fragment>
          <Label>{fieldName}</Label>
          <Field
            name={fieldName}
            placeholder={formField.placeholder || formField.label}
            type={formField.type === "string" ? "text" : ""}
            as={Input}
          />
        </Fragment>
      )}
      {formField.type === FormTypes.CHECKBOX && (
        <Label>
          <Field as={Checkbox} type="checkbox" name={fieldName} />
          {formField.label}
        </Label>
      )}
      {formField.type === FormTypes.SELECT && (
        <Fragment>
          <Label>{fieldName}</Label>
          <MultiSelect
            options={formField.options}
            selected={meta.value}
            // onSelectedChanged={(selected) => this.setState({ selected })}
            // onChange={(selected) => setFieldValue(fieldName)}
          />
        </Fragment>
      )}
    </Box>
  ); 
}