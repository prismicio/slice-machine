import { FormTypes } from './types'

import { createValidationArgs } from '.'

export const CheckBox = (label: string, required = true, defaultValue = true) => ({
  type: FormTypes.CHECKBOX,
  validate: {
    required: createValidationArgs(required, defaultRequired),
  },
  required,
  label,
  defaultValue,
  yupType: 'boolean',
})

export const Select = (label: string, options: any, required = true, multi = true, defaultValue = true) => ({
  type: FormTypes.SELECT,
  required,
  label,
  options,
  multi,
  defaultValue,
  yupType: 'array',
})

const defaultMin = [3, 'String is too short. Min: 3']
const defaultMax = [35, 'String is too long. Max: 35']
const defaultRequired = ['Field is required']

export const Input: any = (
  label: string,
  conditions: { min: any, max: any, required: any, matches?: any } = {
    min: defaultMin,
    max: defaultMax,
    required: defaultRequired,
  },
  fieldLevelValidation: any,
  defaultValue: any
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