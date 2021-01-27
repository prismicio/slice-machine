import { useState } from 'react'
import { Box, Heading, Text, useThemeUI } from 'theme-ui'
import { FaRegQuestionCircle } from 'react-icons/fa'
import { useFormikContext } from 'formik'

import { initialValues, Patterns } from './'

import { NumberOfBlocks, PatternCard } from './components'

import { Flex as FlexGrid, Col } from 'components/Flex'

import { MockConfigKey } from 'src/consts'

const HandlePatternTypes = ({
  options,
  currentKey,
  onUpdate,
  onUpdateBlocks,
  blocksValue
}) => {
  const { theme } = useThemeUI()
  const [displayMore, setDisplayMore] = useState(false)

  const PatternsWithStatus = Object.entries(Patterns).map(([key, pattern]) => ({
    patternKey: key,
    isAllowed: Patterns[key].test(options),
    pattern
  }))

  return (
    <Box>
      <Heading as="h3" mb={0}>
        Mock Pattern
        <FaRegQuestionCircle
          data-for="question-circle"
          color={theme.colors.icons}
          onClick={() => setDisplayMore(!displayMore)}
          style={{
            position: 'relative',
            cursor: 'pointer',
            top: '3px',
            height: '18px', 
            marginLeft: '8px'
          }}
        />
      </Heading>
      {
        displayMore ? (
          <Box
            variant="plain"
            sx={{
              p: 2,
              my: 2,
              border: '1px solid',
              borderColor: 'borders',
              bg: 'headSection'
            }}
          >
            <Heading as="h4">More info</Heading>
            <Text as="p" mt={1} mb={1}>
              To generate mock content, we'll use the pattern you defined.<br/>
              A pattern is an array of RichText options, repeated "block" times.
            </Text>
            <Text as="p" mb={3}>
              For example, if you set "Number of Blocks" to 1-3, and pattern<br/> to "Paragraph",
              we will generate between 1 and 3 paragraphs.
            </Text>
          </Box>
        ) : null
      }
      <FlexGrid mt={3}>
        <Col>
          <Heading as="h4" mb={2}>Type</Heading>
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
  const { values, setFieldValue, ...context } = useFormikContext()
  const options = (values.single || values.multi).split(',')

  const configValues = values[MockConfigKey]?.config || {}
  
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
        currentKey={configValues.patternType || '_'}
        onUpdate={onSetPattern}
        onUpdateBlocks={onSetBlocks}
        blocksValue={configValues.blocks || 1}
        currentValue={Patterns[configValues.patternType || '_'].value(options)}
      />
    </Box>
  )
}

Form.initialValues = initialValues

export const MockConfigForm = Form