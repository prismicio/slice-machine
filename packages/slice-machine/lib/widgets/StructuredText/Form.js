import { useEffect, useState } from 'react'
import * as yup from 'yup'
import { CheckBox as CheckBoxConstructor } from 'lib/forms/fields'
import { DefaultFields } from 'lib/forms/defaults'

import options, { optionValues } from './options'

import WidgetFormField from 'lib/builder/modules/EditModal/Field'

import { Text, Button, Label, Checkbox, Flex, Box } from 'theme-ui'
import { Col, Flex as FlexGrid } from 'components/Flex'
import IconButton from 'components/IconButton'

const isAllSet = (curr) => !optionValues.find(e => !curr.includes(e))

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
  allowTargetBlank: CheckBoxConstructor('Allow target blank for links')
}

const accessors = ['single', 'multi']

const Form = (props) => {
  const { initialValues, values: formValues, errors, Model, variation, fieldType, setFieldValue, } = props
  const { single, multi } = formValues
  const initialOptions = single ? _createInitialOptions(single)
    : (multi && _createInitialOptions(multi))
    || optionValues
  
  const [isMulti, setIsMulti] = useState(single ? false : true)
  const [acceptOptions, setAcceptOptions] = useState(initialOptions)

  useEffect(() => {
    const fieldNameIndex = isMulti ? 1 : 0
    setFieldValue(accessors[fieldNameIndex], acceptOptions.join(','))
    setTimeout(() => { // prevent tests from failing for both values
      setFieldValue(accessors[1 - fieldNameIndex], undefined)
    }, 100)

  }, [isMulti, acceptOptions])

  return (
    <FlexGrid>
      {
        Object.entries(FormFields).map(([key, field]) => (
          <Col key={key}>
            <WidgetFormField
              fieldName={key}
              fieldType={fieldType}
              formField={field}
              Model={Model}
              variation={variation}
              initialValues={initialValues}
            />
          </Col>
        ))
      }
      <Col>
        <Label
          htmlFor="accept"
          variant="label.primary"
          sx={{
            mt: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Accept*
          <Button
            type="button"
            variant="buttons.textButton"
            onClick={() => {
              if (isAllSet(acceptOptions)) {
                return setAcceptOptions([])
              }
              setAcceptOptions(optionValues)
            }}
          >
            {
              isAllSet(acceptOptions) ? 'Unselect All' : 'Select all'
            }
          </Button>
        </Label>
        {
          options.map(opt => console.log({ opt }) || (
            <IconButton
              fitButton
              useActive
              // key={opt.value}
              // label={opt.label}
              // size={20}
              // Icon={console.log(opt) || opt.icon}
              sx={{
                p: '20px',
                mb: 2,
                mr: 3,
                variant: 'buttons.selectIcon',
              }}
              active={acceptOptions.find(e => e === opt.value)}
              onClick={() => {
                if (acceptOptions.find(e => e === opt.value)) {
                  return setAcceptOptions(acceptOptions.filter(e => e !== opt.value))
                }
                setAcceptOptions([...acceptOptions, opt.value ])
              }}
            />
          ))
        }
        {
          errors[accessors[isMulti ? 1 : 0]] ? (
            <Box sx={{ position: 'absolute' }}>
              <Text as="span" variant="text.labelError" pl={0}>{errors[accessors[isMulti ? 1 : 0]]}</Text>
            </Box>
          ) : null
        }
      </Col>
      <Col>
        <Flex
          sx={{
            mt: 2,
            alignItems: 'center',
            height: '110%'
          }}
        >
          <Label variant="label.border">
            <Checkbox
              value={isMulti}
              defaultChecked={isMulti}
              onChange={() =>  setIsMulti(!isMulti)}
            />
            👈 Allow multiple paragraphs
          </Label>
        </Flex>
      </Col>
    </FlexGrid>
  )
}

const keys = ['single', 'multi']
keys.forEach((key, index) => {
  FormFields[key] = {
    validate: () => yup.string().test({
      name: key,
      message: `Options cannot be empty`,
      test: function() {
        if (this.parent[keys[1 - index]] && typeof this.parent[keys[1 - index]] === 'string') {
          // if other key is set
          return true
        }
        if (typeof this.parent[key] !== 'string') {
          return false
        }
        if (
          (!this.parent[key] || !this.parent[key].length)
          && (!this.parent[keys[1 - index]] || !this.parent[keys[1 - index]].length)
        ) {
          // if both keys are undefined
          return false
        }
        const arr = this.parent[key].split(',')
        if (arr.find(e => !optionValues.includes(e))) {
          return false
        }
        return true
      }
    })
  }
})

export { FormFields }

export default Form