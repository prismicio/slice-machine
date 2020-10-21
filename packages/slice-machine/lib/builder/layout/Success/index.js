import { Box, Heading } from 'theme-ui'

const Success = ({ data, display = false }) => {
  return display ? (
     <Box
        variant={`success.${data.error ? 'error' : 'done'}`}
        sx={{ position: 'absolute', top: '48px' }}
      >
        <Box sx={{ display: 'inline' }}>
          <Heading as="h5" sx={{ color: '#FFF', textAlign: 'center' }}>
            { data.message }
          </Heading>
        </Box>
      </Box>
    ): null
}

export default Success