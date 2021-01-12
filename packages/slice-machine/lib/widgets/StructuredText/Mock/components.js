import { useState } from 'react'
import { Flex, Box, Label, Radio, Heading, Input, Text, useThemeUI } from 'theme-ui'
import { FaRegQuestionCircle } from 'react-icons/fa'

import { Defaults, Patterns, PatternRequirements, PatternLabels } from './'

export const PatternCard = ({ patternKey, isAllowed, pattern, onUpdate }) => {

  return (
    <Label
      sx={{
        p: 2,
        my: 2,
        border: '1px solid',
        borderRadius: '3px',
        borderColor: 'borders'
      }}
    >
      <Radio
        name="pattern"
        value={patternKey}
        disabled={!isAllowed}
        onChange={() => onUpdate(patternKey, false)}
        // checked={value === patternKey ? 'true' : 'false'}
        // defaultChecked={(value === patternKey)}
      />
      { PatternLabels[patternKey] } { isAllowed ? '' : '(disabled)'}
    </Label>
  )
}

const PreTab = ({ content }) => (
  <Text
    as="span"
    sx={{
      position: 'absolute',
      left: '9px',
      height: 'calc(100% - 2px)',
      display: 'flex',
      alignItems: 'center',
      bg: 'borders',
      px: 1,
    }}
  >
    { content }
  </Text>
)

export const HandleMinMax = ({ title, value, moreInfo, onUpdate }) => {

  const _onUpdate = (key, val) => {
    onUpdate({
      ...value,
      [key]: parseInt(val)
    })
  }

  return (
    <Box my={3}>
      <Text as="p" mb={2}>{title}</Text>
      <Flex sx={{ maxWidth: '440px', alignItems: 'center' }}>
        <Label sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <PreTab content="Min." />
          <Input
            type="number"
            onChange={e => _onUpdate('min', e.target.value)}
            value={value.min} 
            sx={{
              bg: 'backgroundClear',
              pl: '48px',
              fontSize: 2,
              ml: 2
            }}
          />
        </Label>
        <Label sx={{ ml: 2, display: 'flex', alignItems: 'center', position: 'relative' }}>
          <PreTab content="Max." />
          <Input
            type="number"
            onChange={e => _onUpdate('max', e.target.value)}
            value={value.max} 
            sx={{
              bg: 'backgroundClear',
              pl: '48px',
              fontSize: 2,
              ml: 2
            }}
          />
        </Label>
      </Flex>
      <Text as="p" sx={{ mt: 2 }}>{moreInfo}</Text>
    </Box>
  )
}