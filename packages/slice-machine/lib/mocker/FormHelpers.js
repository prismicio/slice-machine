export const FormTypes = {
  CHECKBOX: "checkbox",
  STRING: "string",
  SELECT: "select"
};

export const CheckBox = (label = '', required = true, defaultValue = true) => ({
  type: FormTypes.CHECKBOX,
  required,
  label,
  default: defaultValue
})

export const Select = (label = '', options, required = true, multi = true, defaultSelected = true) => ({
  type: FormTypes.SELECT,
  required,
  label,
  options,
  multi,
  defaultSelected
})

export const DefaultFields = {
  name: {
    type: FormTypes.STRING,
    required: true,
    max: 65,
    min: 3
  },
  id: {
    required: true,
    from: ({ name }) => `${name}-with-something`
  },
  placeholder: {
    type: FormTypes.STRING,
    required: true,
    max: 65,
    min: 3
  }
}

export const handleDefaultValue = (field) => {
  if (field.default !== undefined) {
    return field.default
  }
  if (field.type === FormTypes.CHECKBOX) {
    return true
  }
  if (field.type === FormTypes.STRING) {
    return ''
  }
  if (field.type === FormTypes.SELECT) {
    return [];
  }
  return
}