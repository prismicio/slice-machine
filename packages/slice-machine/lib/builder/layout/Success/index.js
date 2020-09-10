import { Box, Heading } from 'theme-ui'

const Success = ({ data, display = false }) => {

  const text = data.done ? data.message : data.error
  return display ? (
     <Box
        variant={`success.${data.error ? 'error' : 'done'}`}
        sx={{ position: 'absolute', top: '48px' }}
      >
        <Box sx={{ display: 'inline' }}>
          <Heading as="h5" sx={{ color: '#FFF', textAlign: 'center' }}>
            { text }
          </Heading>
        </Box>
      </Box>
    ): null
}

export default Success