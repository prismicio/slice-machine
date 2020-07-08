import randomSentence from 'random-sentence'

import { CheckBox, Select } from '../forms/fields'
import { DefaultFields } from "../forms/defaults";

/**
 * {
    "type": "StructuredText",
    "config": {
      "label": "Title",
      "single": "heading1, heading2, heading3, heading4, heading5, heading6"
    }
  } 
*/

const _create = (str) => [{
  type: 'paragraph',
  "text": str,
  spans: []
}]

const fromUser = (mock) => {
  return typeof mock === 'object' ? mock : _create(mock)
}

const create = (maybeMock) => maybeMock
  ? fromUser(maybeMock)
  : _create(randomSentence({ min: "10", max: "120" }))

const Meta = {
  title: 'Rich Text',
  description: 'A rich text field with formatting options'
}


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

const FormFields = {
  ...DefaultFields,
  multi: CheckBox('Allow multiple paragraphs'),
  allowTargetBlank: CheckBox('Allow target blank for links'),
  accepts: Select('Allowed elements', options)
}

export default {
  create,
  fromUser,
  FormFields,
  Meta
}