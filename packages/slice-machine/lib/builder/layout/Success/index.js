import { Box, Heading, Close } from 'theme-ui'

const Success = ({ data, onClose, display = false }) => {
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
        <Close
          onClick={onClose}
          sx={{ 
            position: 'absolute',
            right: '22px',
            top: '2px',
            color: '#FFF'
          }}
        />
      </Box>
    ): null
}

export default Success