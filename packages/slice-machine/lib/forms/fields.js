import * as FormTypes from './types'

export const CheckBox = (label, required = true, defaultValue = true) => ({
  type: FormTypes.CHECKBOX,
  required,
  label,
  default: defaultValue
})

export const Select = (label, options, required = true, multi = true, defaultSelected = true) => ({
  type: FormTypes.SELECT,
  required,
  label,
  options,
  multi,
  defaultSelected
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
  fieldLevelValidation
) => {
   const { min, max, required, matches } = conditions || {}
  return {
    type: FormTypes.INPUT,
    label,
    validate: {
      required: required === true ? defaultRequired : required,
      min: min === true ? defaultMin : min,
      max: max === true ? defaultMax : max,
      matches,
    },
    fieldLevelValidation,
    yupType: 'string',
  }
}