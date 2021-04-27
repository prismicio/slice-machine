import Modal from 'react-modal'

import { Box, Close, Flex, Heading, Button, Text, Image } from 'theme-ui'

import Card from 'components/Card'

const SuccessModal = ({
  close,
  previewUrl
}) => (
  <Modal
    isOpen
    shouldCloseOnOverlayClick
    onRequestClose={close}
    contentLabel="After save modal"
    style={{ width: '600px' }}
  >
    <Card
      borderFooter
      footerSx={{ p: 3 }}
      bodySx={{ pt: 2, pb: 4, px: 4 }}
      sx={{ border: 'none' }}
      Header={({ radius }) => (
        <Flex
          sx={{
            p: 3,
            pl: 4,
            bg: '#fff',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
            borderBottom: t => `1px solid ${t.colors.borders}`
          }}
        >
          <Heading>Success!</Heading>
          <Close onClick={close} type="button" />
        </Flex>
      )}
      Footer={(
        <Flex sx={{ alignItems: 'space-between' }}>
          <Box sx={{ ml: 'auto' }} />
          <Button
            mr={2}
            type="button"
            onClick={close}
            variant="secondary"
            >
            Close
          </Button>
          <Button
            type="button"
          >
            Preview component
          </Button>
        </Flex>
      )}
    >
      <Box sx={{ textAlign: 'center', pt: 4 }}>
        <Text as="p">
          Your model was correctly updated!<br/> We also generated a mock that you can use with Storybook.
        </Text>
        <Image mt={4} src={previewUrl} sx={{ width: '50%' }}/>
      </Box>
    </Card>
  </Modal>
)

export default SuccessModal

/**{
      data.error ? (
        <Alert py={0} px={2} mr={2}>
          <Text as="p" variant="small">Could not update model. See console for full error.</Text>
          <Close ml='auto' mr={-2} onClick={() => setData({ ...data, error: null, done: false })} />
        </Alert>
      ) : null
    }
    {
      data.done ? (
        <Alert py={0} px={2} mr={2}>
          <Text as="p" variant="small">Correctly updated! Mocks have been generated succesfully</Text>
          <Close ml='auto' mr={-2} onClick={() => setData({ ...data, error: null, done: false })} />
        </Alert>
      ) : null
    } */