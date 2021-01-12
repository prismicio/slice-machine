import { useState } from 'react'
import { Flex, Box, Label, Radio, Heading, Input, Text, useThemeUI } from 'theme-ui'
import { FaRegQuestionCircle } from 'react-icons/fa'

import { Defaults, Patterns, PatternRequirements, PatternLabels } from './'

import { HandleMinMax, PatternCard } from './components'

const HandlePatternTypes = ({ options, currentKey, currentValue, onUpdate }) => {
  const { theme } = useThemeUI()
  const [displayMore, setDisplayMore] = useState(false)

  const isCustom = currentKey === 'CUSTOM'

  const PatternsWithStatus = Object.entries(Patterns).map(([key, pattern]) => ({
    patternKey: key,
    isAllowed: PatternRequirements[key](options),
    pattern
  }))

  return (
    <Box>
      <Heading as="h3" mb={0}>
        Pattern
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
              we will generate between 1 and 3 pargaraphs.
            </Text>
          </Box>
        ) : null
      }
      {
        PatternsWithStatus.map(({ patternKey, ...rest }) => (
          <PatternCard
            key={patternKey}
            patternKey={patternKey}
            onUpdate={onUpdate}
            {...rest}
          />
        ))
      }
    </Box>
  )

}

export const MockConfigForm = ({ widgetConfig, mockConfig, onUpdate }) => {
  const options = (widgetConfig.single || widgetConfig.multi).split(',')
  const formValues = Object.assign(Defaults, mockConfig)

  const onUpdateWithKey = (key) => (value) => onUpdate(key, value)

  const onSetPattern = (value, isPattern) => {
    onUpdate(isPattern ? 'pattern' : 'patternType', value)
  }

  return (
    <Box>
      <HandleMinMax
        title="Sentences Per Paragraph"
        value={formValues.sentencesPerParagraph}
        onUpdate={onUpdateWithKey('sentencesPerParagraph')}
        moreInfo="👆 Average number of sentences generated for each paragraph"
      />
      <HandleMinMax
        title="Words Per Sentence"
        value={formValues.wordsPerSentence}
        onUpdate={onUpdateWithKey('wordsPerSentence')}
        moreInfo="👆 Average number of words generated for each sentence"
      />
      <HandleMinMax
        title="Number of Blocks"
        value={formValues.blocks}
        onUpdate={onUpdateWithKey('blocks')}
        moreInfo="👆 Average number of times the pattern will be applied"
      />
      <HandlePatternTypes
        options={options}
        currentKey={formValues.pattern ? 'CUSTOM' : formValues.patternType || '_'}
        onUpdate={onSetPattern}
        currentValue={
          formValues.patternType === 'CUSTOM'
          ? formValues.patternValue
          : Patterns[formValues.patternType || '_'](options)
        }
      />
    </Box>
  )
}

export const MockContentForm = null
