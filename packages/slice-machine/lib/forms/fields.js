import * as FormTypes from './types'

import { createValidationArgs } from './'

export const CheckBox = (label, required = true, defaultValue = true) => ({
  type: FormTypes.CHECKBOX,
  validate: {
    required: createValidationArgs(required, defaultRequired),
  },
  required,
  label,
  default: defaultValue,
  yupType: 'boolean',
})

export const Select = (label, options, required = true, multi = true, defaultSelected = true) => ({
  type: FormTypes.SELECT,
  required,
  label,
  options,
  multi,
  defaultSelected,
  yupType: 'array',
})

const defaultMin = [3, 'String is too short. Min: 3']
const defaultMax = [35, 'String is too long. Max: 35']
const defaultRequired = ['Field is required']

export const Input = (
  label,
  conditions = {
    min: defaultMin,
    max: defaultMax,
    required: defaultRequired
  },
  fieldLevelValidation,
  defaultValue
) => {
   const { min, max, required, matches } = conditions || {}
  return {
    type: FormTypes.INPUT,
    label,
    validate: {
      required: createValidationArgs(required, defaultRequired),
      min: createValidationArgs(min, defaultMin),
      max: createValidationArgs(max, defaultMax),
      matches,
    },
    defaultValue,
    fieldLevelValidation,
    yupType: 'string',
  }
}