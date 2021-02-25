import { useState } from 'react'
import { Box, Text, Label, Flex, Radio } from 'theme-ui'
import { useFormikContext } from 'formik'
import { BlockPicker } from 'react-color'

import { initialValues } from '.'

import { MockConfigKey } from 'src/consts'

const RAND = 'random'

export const SelectionCard = ({ name, checked, onSelect, children }) => {
  return (
    <Label
      sx={{
        border: '1px solid',
        borderRadius: '3px',
        borderColor: 'borders',
        display: 'block',
        position: 'relative',
        bg: 'headSection',
        mb: 2
      }}
    >
      <Flex sx={{ p: 2, }}>
        <Radio
          name={name}
          onChange={onSelect}
          checked={checked}
        />
        { children }
      </Flex>
    </Label>
  )
}

const Form = () => {
  const { values, setFieldValue } = useFormikContext()

  const contentValue = values[MockConfigKey]?.content || null
  const [transitionPreserved, preserveTransition] = useState(false)
  const [lastValue, setLastValue] = useState(contentValue)
  
  const onChange = (color) => {
    setLastValue(color.hex)
    setFieldValue(MockConfigKey, {
      content: color.hex
    })
  }
  const reset = () => {
    setFieldValue(MockConfigKey, {})
  }

  const startPreserveTransition = () => {
    preserveTransition(true)
    setTimeout(() => preserveTransition(false), 1000)
  }

  return (
    <Box>
      <Label variant="label.primary" sx={{ display: 'block' }}>
        <Text as="span" mb={1} sx={{ display: 'inline-block' }}>Color value</Text>
        <SelectionCard
          value={contentValue}
          name={RAND}
          onSelect={reset}
          checked={contentValue === null}
        >
          Random Color
        </SelectionCard>
        <SelectionCard
          name="custom"
          value={contentValue}
          onSelect={() => onChange({ hex: lastValue || '#111' })}
          checked={contentValue !== null}
        >
          Custom Color
        </SelectionCard>
        {
          contentValue || transitionPreserved ? (
            <BlockPicker
              color={contentValue || lastValue}
              onChangeComplete={onChange}
              onChange={startPreserveTransition}
            />
          ) : null
        }
      </Label>
    </Box>
  )
}

Form.initialValues = initialValues

export const MockConfigForm = Form