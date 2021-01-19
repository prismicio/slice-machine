import { useState } from 'react'
import { Textarea, Flex, Box, IconButton, Button, Radio, Heading, Input, Text, useThemeUI } from 'theme-ui'
import { FaRegQuestionCircle, FaRegTrashAlt } from 'react-icons/fa'
import { useFormikContext } from 'formik'

import { initialValues, Patterns } from './'

import { NumberOfBlocks, PatternCard } from './components'

import { Flex as FlexGrid, Col } from 'components/Flex'

import { MockConfigKey } from 'src/consts'

const HandlePatternTypes = ({
  options,
  currentKey,
  currentValue,
  onUpdate,
  onUpdateBlocks,
  blocksValue
}) => {
  const { theme } = useThemeUI()
  const [displayMore, setDisplayMore] = useState(false)

  const isCustom = currentKey === 'CUSTOM'

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

export const HandleContent = ({ currentValue, onUpdate }) => {

  return (
    <Box my={3}>
      <Heading as="h3" mb={3}>
        Or Use Content
      </Heading>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Text as="p" mb={2}>Paste a RichText here 👇</Text>
        <IconButton type="button" variant="transparent">
          <FaRegTrashAlt size="20px" />
        </IconButton>
      </Flex>
      <Textarea
        rows={4}
        placeholder='[{ "type": "paragraph", "content": "..." }]'
      />
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
      {/* <HandleMinMax
        title="Sentences Per Paragraph"
        value={configValues.sentencesPerParagraph}
        onUpdate={onUpdateWithKey('sentencesPerParagraph')}
        moreInfo="👆 Average number of sentences generated for each paragraph"
      />
      <HandleMinMax
        title="Words Per Sentence"
        value={configValues.wordsPerSentence}
        onUpdate={onUpdateWithKey('wordsPerSentence')}
        moreInfo="👆 Average number of words generated for each sentence"
      />
      <HandleMinMax
        title="Number of Blocks"
        value={configValues.blocks}
        onUpdate={onUpdateWithKey('blocks')}
        moreInfo="👆 Average number of times the pattern will be applied"
      /> */}
      <HandlePatternTypes
        options={options}
        currentKey={configValues.pattern ? 'CUSTOM' : configValues.patternType || '_'}
        onUpdate={onSetPattern}
        onUpdateBlocks={onSetBlocks}
        blocksValue={configValues.blocks || 1}
        currentValue={
          configValues.patternType === 'CUSTOM'
          ? configValues.patternValue
          : Patterns[configValues.patternType || '_'].value(options)
        }
      />
      {/* <HandleContent currentValue="Lalala" /> */}
    </Box>
  )
}

Form.initialValues = initialValues

export const MockConfigForm = Form