import { MdTextFields } from 'react-icons/md'
import { Fragment, useState, useEffect } from 'react'
import * as yup from 'yup'
import { useFormikContext } from 'formik'
import randomSentence from 'random-sentence'

import MultiSelect from '@khanacademy/react-multi-select'

import { Label } from 'theme-ui'

import {
  createInitialValues,
  createValidationSchema
} from '../forms'

import { removeProp } from '../utils'
import { CheckBox } from '../forms/fields'
import { DefaultFields } from '../forms/defaults'

import { FormFieldCheckbox } from '../../components/FormFields'

/**
 * {
    "type": "StructuredText",
    "config": {
      "label": "Title",
      "single": "heading1, heading2, heading3, heading4, heading5, heading6"
    }
  }
*/

const TYPE_NAME = 'StructuredText'

const options = [{
  value: 'p',
  label: 'P'
}, {
  value: 'pre',
  label: 'PRE'
}, {
  value: 'h1',
  label: 'H1'
}, {
  value: 'h2',
  label: 'H2'
}, {
  value: 'h3',
  label: 'H3'
}, {
  value: 'h4',
  label: 'H4'
}, {
  value: 'h5',
  label: 'H5'
}, {
  value: 'h6',
  label: 'H6'
}, {
  value: 'rtl',
  label: 'RTL'
}]

const optionValues = options.map(e => e.value)

const _createMock = (str) => [{
  type: 'paragraph',
  "text": str,
  spans: []
}]

const fromUser = (mock) => {
  return typeof mock === 'object' ? mock : _createMock(mock)
}

const createMock = (maybeMock) => maybeMock
  ? fromUser(maybeMock)
  : _createMock(randomSentence({ min: "10", max: "120" }))

const Meta = {
  icon: MdTextFields,
  title: 'Rich Text',
  description: 'A rich text field with formatting options'
}

const _createInitialOptions = (str) => {
  const arr = str.split(',')
  return options.reduce((acc, { value }) => {
    if (arr.includes(value)) {
      return [...acc, value]
    }
    return acc
  }, [])
}
const FormFields = {
  ...DefaultFields,
  // allowMultiLine: CheckBox('Allow multiple paragraphs'),
  allowTargetBlank: CheckBox('Allow target blank for links'),
  // accepts: Select('Allowed elements', options),
  accepts: {
    component: ({ field, helpers }) => {
      const { values: { single, multi } } = useFormikContext()
      const initialOptions = single ? _createInitialOptions(single)
        : (multi && _createInitialOptions(multi))
        || optionValues
      const [state, setState] = useState({ options: initialOptions })

      useEffect(() => {
        helpers.setValue(state.options)
      }, [state.options])
      return (
        <Fragment>
          <Label>Accepts</Label>
          <MultiSelect
            options={options}
            selected={state.options}
            onSelectedChanged={(selected) => console.log({ selected }) || setState({ options: selected })}
            {...field}
          />
        </Fragment>
      )
    }
  },
  single: {
    yupType: 'string',
    component: ({ field, helpers }) => {
      const { values: { accepts, allowMultiLine }, registerField, unregisterField } = useFormikContext()
      
      console.log(field.value)
      useEffect(() => {
        if (allowMultiLine) {
          helpers.setValue(undefined)
          unregisterField('single')
        } else {
          helpers.setValue(accepts.join(','))
        }
      }, [])

      useEffect(() => {
        helpers.setValue(accepts.join(','))
        if (allowMultiLine) {
          unregisterField('single')
        } else {
          registerField('single', accepts.join(','))
        }
      }, [allowMultiLine, accepts])
      return null
    }
  },
  multi: {
    yupType: 'string',
    component: ({ field, helpers }) => {
      const { values: { accepts, allowMultiLine }, registerField } = useFormikContext()
      useEffect(() => {
        helpers.setValue(accepts.join(','))
        if (!allowMultiLine) {
          helpers.setValue(undefined)
        }
      }, [])

      useEffect(() => {
        helpers.setValue(accepts.join(','))
        if (!allowMultiLine) {
          helpers.setValue(undefined)
        } else {
          registerField('multi', accepts.join(','))
        }
      }, [allowMultiLine, accepts])
      return null
    }
  },
  allowMultiLine: {
    yupType: 'string',
    defaultValue: false,
    component: (props) => {
      const { values: { accepts, ...values }, setFieldValue, registerField, unregisterField } = useFormikContext()
      const fieldNames = ['single', 'multi']
      const [isChecked, setIsChecked] = useState(values.single ? false : true)
      const [fieldName, setFieldName] = useState(fieldNames[0])

      // console.log(rest)

      // useEffect(() => {
      //   setFieldValue(fieldName, accepts.join(','))
      //   return () => {
      //     registerField("example", true)
      //     unregisterField("allowMultiLine")
      //     unregisterField("accepts")
      //     console.log('delete accepts!')
      //   }
      // }, [])

      // useEffect(() => {
      //   const prevFieldName = fieldName
      //   const newFieldName = fieldNames[1 - fieldNames.findIndex(e => e === prevFieldName)]
      //   setFieldValue(prevFieldName, undefined)
      //   setFieldValue(newFieldName, accepts.join(','))
      //   setFieldName(newFieldName)
      // }, [isChecked, accepts])

      return (
        <FormFieldCheckbox
          {...props}
          // meta={{ value: isChecked }}
          label="Allow multiple paragraphs"
          onChange={(v) => props.helpers.setValue(v)}
        />
      )
    }
  }
}

const create = (apiId) => ({
  ...createInitialValues(FormFields),
  accepts: options.map(e => e.value),
  id: apiId
})

const schema = yup.object().shape({
  type: yup.string().matches(/^StructuredText$/, { excludeEmptyString: true }).required(),
  config: createValidationSchema(removeProp(FormFields, 'id'))
})

export default {
  create,
  createMock,
  FormFields,
  Meta,
  schema,
  TYPE_NAME
}