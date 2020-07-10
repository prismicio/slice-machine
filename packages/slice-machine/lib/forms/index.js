import * as Yup from 'yup';
import * as FormTypes from './types'

const handleDefaultValue = (field) => {
  if (field.default !== undefined) {
    return field.default
  }
  if (field.type === FormTypes.CHECKBOX) {
    return true
  }
  if (field.type === FormTypes.INPUT) {
    return ''
  }
  if (field.type === FormTypes.SELECT) {
    return [];
  }
  return
}

export const createInitialValues = (FormFields) => {
  return Object.entries(FormFields).reduce((acc, [key, val]) => {
    const value = handleDefaultValue(val)
    if (value !== undefined) {
      return {
        ...acc,
        [key]: value
      }
    }
    return acc
  }, {})
}


export const createValidationSchema = (FormFields) => {
  return Yup.object().shape(
    Object.entries(FormFields).reduce((acc, [key, formField]) => {
      const { validate, yupType } = formField
      if (!validate) {
        return acc
      }
      let validator = Yup[yupType]()
      Object.entries(validate).filter(e => e[1]).forEach(([func, args]) => {
        if (args && validator[func]) {
          validator = validator[func](...args)
          return
        }
        console.warn(`Invalid Yup validator for field "${key}"`)
      })
      return {
        ...acc,
        [key]: validator
      }
  }, {}))
}