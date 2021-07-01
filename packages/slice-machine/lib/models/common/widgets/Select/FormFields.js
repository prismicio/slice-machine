import * as yup from 'yup'
import { FormFieldCheckboxControl } from 'components/FormFields'

import { FormTypes } from 'lib/forms/types'

import { DefaultFields } from 'lib/forms/defaults'
import { FormFieldArray } from 'components/FormFields'

const FormFields = {
  ...DefaultFields,
  default_value: {
    type: FormTypes.CHECKBOX,
    yupType: 'string',
    defaultValue: '',
    validate: function() {
      return yup.string().test({
        name: 'default_value',
        message: 'Default value is not part of field "options" in Select',
        test: function(value) {
          return value === undefined
            || (this.parent && this.parent.options && this.parent.options.find(e => e === value))
        }
      })
    },
    component: (props) => (
      <FormFieldCheckboxControl
        {...props}
        defaultValue={props.field.value}
        getFieldControl={(formValues) => formValues.config?.options}
        setControlFromField={(options, isChecked) => isChecked ? options.length && options[0] : undefined}
        label={(options) => `use first value as default ${options.length ? `("${options[0]}")` : ''}`}
      />
    )
  },
  options: {
    yupType: 'array',
    defaultValue: ['', ''],
    validate: {
      required: ['Select requires a minimum of 2 options'],
      min: [2, 'Choose at least 2 options'],
      test: {
        name: 'non-empty values',
        message: 'Values cannot be empty',
        test(value) {
          return !(value.some(e => !e || !e.length))
        }
      }
    },
    component: (props) => {
      return (
        <FormFieldArray
          label="Options"
          inputPlaceholder="Select option (eg. 'image_left')"
          buttonLabel="Add option"
          {...props}
        />
      )
    }
  },
}

export default FormFields