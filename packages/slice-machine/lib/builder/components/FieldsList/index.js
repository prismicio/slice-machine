import {
  Box,
  Flex,
  Text,
  Heading,
  Badge,
  IconButton
} from 'theme-ui'

import NewField from './NewField'

const EditButton = ({ onClick }) => (
  <IconButton
    onClick={onClick}
    aria-label='Toggle dark mode'>
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      width='24'
      height='24'
      fill='currentcolor'>
      <circle
        r={11}
        cx={12}
        cy={12}
        fill='none'
        stroke='currentcolor'
        strokeWidth={2}
      />
    </svg>
  </IconButton>
)

const FieldsList = ({
  fields,
  title,
  enterEditMode,
  newField,
  Model,
  onSaveNewField
}) => (
  <Box>
    <Heading>{ title }</Heading>
    <ul>
      {
        Object.entries(fields).map(([key, value]) => {
          const { type, config: { label } } = value
          return (
            <Flex
              key={key}
              as="li"
              p={3}
              sx={{
                border: "1px solid #F1F1F1",
                justifyContent: "space-between",
              }}
            >
              <Text>{label || key} (id: {key})</Text>
              <Box>
                <EditButton
                  onClick = {
                    () => enterEditMode([key, value])
                  }
                />
                <Badge ml={2}>{type}</Badge>
              </Box>
            </Flex>
          );
        })
      }
      {
        newField ? (
          <NewField
            {...newField}
            Model={Model}
            onSave={onSaveNewField}
          />
        ) : null
      }
    </ul>
  </Box>
)

export default FieldsList