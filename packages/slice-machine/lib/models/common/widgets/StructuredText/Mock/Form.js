import { useEffect, useState } from 'react'
import { Label, Box, useThemeUI } from 'theme-ui'
import { FaRegQuestionCircle } from 'react-icons/fa'
import { useFormikContext } from 'formik'

import {
  initialValues,
  Patterns,
  DEFAULT_PATTERN_KEY
} from '.'

import { NumberOfBlocks, PatternCard } from './components'

import Tooltip from 'components/Tooltip'
import { Flex as FlexGrid, Col } from 'components/Flex'

import { MockConfigKey } from '../../../../../consts'

const dataTip = `To generate mock content, we'll use the selected pattern.<br/>A pattern is an array of RichText options, repeated "block" times.`

const HandlePatternTypes = ({
  options,
  currentKey,
  onUpdate,
  onUpdateBlocks,
  blocksValue
}) => {
  const { theme } = useThemeUI()

  const PatternsWithStatus = Object.entries(Patterns).map(([key, pattern]) => ({
    patternKey: key,
    isAllowed: Patterns[key].test(options),
    pattern
  }))

  return (
    <Box>
      <Tooltip id="richtext-mock" />
      <FlexGrid mt={3}>
        <Col>
          <Label variant="label.primary">
            Mock Pattern
            <FaRegQuestionCircle
              data-for="richtext-mock"
              data-multiline="true"
              data-tip={dataTip}
              color={theme.colors.icons}
              style={{
                position: 'relative',
                top: '3px',
                height: '18px', 
                marginLeft: '8px'
              }}
            />
          </Label>
          {
            PatternsWithStatus.map(({ patternKey, ...rest }) => (
              <PatternCard
                key={patternKey}
                patternKey={patternKey}
                onUpdate={onUpdate}
                currentKey={currentKey}
                {...rest}
              />
            ))
          }
        </Col>
        <Col>
        <NumberOfBlocks currentValue={blocksValue} onUpdate={onUpdateBlocks} />
        </Col>
      </FlexGrid>
    </Box>
  )
}

const Form = () => {
  const [patternTypeCheck, setPatternTypeCheck] = useState(null)
  const { values, setFieldValue } = useFormikContext()
  const options = (values.config.single || values.config.multi || '').split(',')

  const configValues = values[MockConfigKey]?.config || {}

  useEffect(() => {
    const { mockConfig: { config: { patternType } } } = values
    if (patternType && patternType !== patternTypeCheck && !Patterns[patternType].test(options)) {
      onUpdate({
        key: 'patternType',
        updateType: 'config',
        value: findValidPattern(options)
      })
      setPatternTypeCheck(patternType)
    }
  })
  
  const onUpdate = ({
    updateType,
    key,
    value,
  }) => {
    setFieldValue(MockConfigKey, {
      [updateType]: {
        ...values[MockConfigKey]?.[updateType] || {},
        [key]: value
      }
    })
  }

  const onSetPattern = (value, isPattern) => {
    onUpdate({
      key: isPattern ? 'pattern' : 'patternType',
      updateType: 'config',
      value,
    })
  }

  const onSetBlocks = (value) => {
    onUpdate({ key: 'blocks', value, updateType: 'config' })
  }

  return (
    <Box>
      <HandlePatternTypes
        options={options}
        currentKey={configValues.patternType || DEFAULT_PATTERN_KEY}
        onUpdate={onSetPattern}
        onUpdateBlocks={onSetBlocks}
        blocksValue={configValues.blocks || 1}
        currentValue={Patterns[configValues.patternType || DEFAULT_PATTERN_KEY].value(options)}
      />
    </Box>
  )
}

const findValidPattern = (config) => {
  const patternEntry = Object.entries(Patterns).find(([, pat]) => pat.test(config))
  if (patternEntry) {
    return patternEntry[0]
  }
  return DEFAULT_PATTERN_KEY
}

Form.onSave = (mockValue, values) => {
  if (!mockValue?.config?.patternType) {
    return mockValue
  }
  const { patternType } = mockValue.config
  const patternObj = Patterns[patternType]
  if (!patternObj) {
    return initialValues
  }
  const options = (values.config.single || values.config.multi).split(',')
  const isValidPatternType = patternObj.test(options)
  if (isValidPatternType) {
    return mockValue
  }
  return {
    ...mockValue,
    config: {
      ...mockValue.config,
      patternType: findValidPattern(options)
    }
  }
}

Form.initialValues = initialValues

export const MockConfigForm = Form