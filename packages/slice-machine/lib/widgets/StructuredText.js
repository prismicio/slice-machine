import { useState, useEffect } from 'react'
import * as yup from 'yup'
import { useFormikContext } from 'formik'
import randomSentence from 'random-sentence'

import {
  createInitialValues,
  createValidationSchema
} from '../forms'

import { removeProp } from '../utils'
import { CheckBox, Select } from '../forms/fields'
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
  title: 'Rich Text',
  description: 'A rich text field with formatting options'
}

const FormFields = {
  ...DefaultFields,
  // allowMultiLine: CheckBox('Allow multiple paragraphs'),
  allowTargetBlank: CheckBox('Allow target blank for links'),
  accepts: Select('Allowed elements', options),
  allowMultiLine: {
    yupType: 'string',
    defaultValue: false,
    component: (props) => {
      const { values: { accepts, ...values }, setFieldValue, registerField, unregisterField } = useFormikContext()
      const fieldNames = ['single', 'multi']
      const [isChecked, setIsChecked] = useState(values.single ? false : true)
      const [fieldName, setFieldName] = useState(fieldNames[0])

      // console.log(rest)

      useEffect(() => {
        setFieldValue(fieldName, accepts.join(','))
        return () => {
          registerField("example", true)
          unregisterField("allowMultiLine")
          unregisterField("accepts")
          console.log('delete accepts!')
        }
      }, [])

      useEffect(() => {
        const prevFieldName = fieldName
        const newFieldName = fieldNames[1 - fieldNames.findIndex(e => e === prevFieldName)]
        setFieldValue(prevFieldName, undefined)
        setFieldValue(newFieldName, accepts.join(','))
        setFieldName(newFieldName)
      }, [isChecked, accepts])

      return (
        <FormFieldCheckbox
          {...props}
          meta={{ value: isChecked }}
          label="Allow multiple paragraphs"
          onChange={setIsChecked}
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