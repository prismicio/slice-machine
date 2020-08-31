import * as yup from 'yup'
import { MdDns } from 'react-icons/md'
import { FormFieldCheckboxControl } from '../../components/FormFields'

import { createValidationSchema } from '../forms'

import { CHECKBOX } from '../forms/types'

import { removeProp, createDefaultWidgetValues } from '../utils'
import { DefaultFields } from '../forms/defaults'
import { FormFieldArray } from '../../components/FormFields'

/**
 * {
      "type" : "Select",
      "config" : {
        "label" : "Image side",
        "default_value" : "left",
        "options" : [ "left", "right" ]
      }
    }
*/

const {
  create,
  TYPE_NAME,
} = createDefaultWidgetValues('Select')

const _createMock = (config) => config.options[Math.floor(Math.random() * config.options.length)]

const createMock = (maybeMock, config) => maybeMock || _createMock(config)

const Meta = {
  icon: MdDns,
  title: 'Select',
  description: 'A rich text field with formatting options'
}

const FormFields = {
  ...DefaultFields,
  default_value: {
    type: CHECKBOX,
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
        fieldName="options"
        setControlFromField={(options) => options.length && options[0]}
        label={(options) => `use first value as default ${options.length ? `("${options[0]}")` : ''}`}
      />
    )
  },
  options: {
    yupType: 'array',
    defaultValue: ['', ''],
    validate: {
      required: ['Select requires a minimum of 2 options'],
      min: [2, 'Choose between 2 and 6 options'],
      max: [6, 'Choose between 2 and 6 options']
    },
    component: (props) => {
      return (
        <FormFieldArray
          label="Options"
          inputPlaceholder="Select option (eg. 'image_left')"
          buttonLabel="+ Add option"
          {...props}
        />
      )
    }
  },
}

const schema = yup.object().shape({
  type: yup.string().matches(/^Select$/, { excludeEmptyString: true }).required(),
  config: createValidationSchema(removeProp(FormFields, 'id'))
})

export default {
  FormFields,
  createMock,
  create,
  schema,
  Meta,
  TYPE_NAME
}
