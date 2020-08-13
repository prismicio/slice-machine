import { Fragment } from 'react'

import { FieldArray } from 'formik'

import { Label, Flex, Input, Button } from 'theme-ui'

const FormFieldArray = ({
  field,
  fieldName,
  label,
  inputPlaceholder,
  buttonLabel
}) => {
  return (
    <Fragment>
      <Label htmlFor={fieldName}>{label}</Label>
      <FieldArray
        name={fieldName}
        id={fieldName}
        {...field}
        render={arrayHelpers => (
          <div>
            {field.value && field.value.length > 0 ? (
              field.value.map((opt, i) => (
                <Flex key={`${fieldName}-${i + 1}`} my={2}>
                  <Input
                    placeholder={inputPlaceholder}
                    name={`${fieldName}.${i}`}
                    value={opt}
                    onChange={({ target: { value }}) => arrayHelpers.replace(i, value)}
                  />
                    <Button
                      xs
                      ml={2}
                      type="button"
                      onClick={() => arrayHelpers.remove(i)}
                    >
                      -
                    </Button>
                </Flex>
              )
              )) : null}
              <Button
                variant="small"
                type="button"
                onClick={() => arrayHelpers.insert(field.value.length, '')}
              >
                {buttonLabel}
              </Button>
          </div>
        )}
      />
    </Fragment>
  )
}

export default FormFieldArray