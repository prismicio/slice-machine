import * as yup from 'yup'

import { useFormikContext } from 'formik'

import {
  createInitialValues,
  createValidationSchema
} from '../forms'

import { removeProp } from '../utils'
import { DefaultFields } from '../forms/defaults'
import { FormFieldArray } from 'components/FormFields'
import { FormFieldCheckbox } from '../../components/FormFields'

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

const TYPE_NAME = 'Select'

const _createMock = (config) => config.options[Math.floor(Math.random() * config.options.length)]

const createMock = (maybeMock, config) => maybeMock || _createMock(config)

const Meta = {
  title: 'Select',
  description: 'A rich text field with formatting options'
}

const FormFields = {
  ...DefaultFields,
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
  default_value: {
    yupType: 'string',
    defaultValue: '',
    validate: (...args) => console.log({ args }),
    component: ({ field, meta, helpers }) => {
      const { values: { options }} = useFormikContext()
      console.log({ field, meta, helpers, options })
      return (
        <FormFieldCheckbox
          meta={meta}
          onChange={(value) => {
            if (value && options.length) {
              helpers.setValue(options[0])
            }
          }}
          label={`use first value as default ${options.length ? `("${options[0]}")` : ''}`}
        />
      )
    }
  }
}

const create = (apiId) => ({
  ...createInitialValues(FormFields),
  id: apiId
})

const schema = yup.object().shape({
  type: yup.string().matches(TYPE_NAME, { excludeEmptyString: true }).required(),
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
