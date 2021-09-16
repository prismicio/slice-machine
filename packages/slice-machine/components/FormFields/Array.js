import { Fragment, useRef, useEffect, useState } from 'react'

import { FieldArray } from 'formik'

import { Text, Label, Flex, Input, Button } from 'theme-ui'

const FormFieldArray = ({
  field,
  meta,
  fieldName,
  label,
  focusOnNewEntry = true,
  inputPlaceholder,
  buttonLabel
}) => {
  const [prevLen, setPrevLen] = useState(meta.value.length)
  const refs = useRef(new Array(meta.value.length))

  useEffect(() => {
    refs.current = refs.current.slice(0, meta.value.length)
  }, [meta.value.length])

  useEffect(() => {
    const len = refs.current.length
    if (focusOnNewEntry && len > prevLen) {
      refs.current[len - 1].focus()
    }
    setPrevLen(len)
  }, [refs.current.length])

  return (
    <Fragment>
      <Label
        variant="label.primary"
        htmlFor={fieldName}
      >
        {label}
        {
        meta.touched && meta.error ? (
          <Text as="span" variant="text.labelError">{meta.error}</Text>
        ) : null
      }
      </Label>
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
                    ref={el => refs.current[i] = el}
                    onChange={({ target: { value }}) => arrayHelpers.replace(i, value)}
                  />
                    <Button
                      xs
                      ml={2}
                      type="button"
                      variant="secondary"
                      onClick={() => arrayHelpers.remove(i)}
                    >
                      -
                    </Button>
                </Flex>
              )
              )) : null}
              <Button
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