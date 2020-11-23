import { Flex, Box, Close } from 'theme-ui'
import Card from './'

const DefaultCard = ({
  children,
  FooterContent,
  HeaderContent,
  close,
}) => (
  <Card
    borderFooter
    footerSx={{ p: 0}}
    bodySx={{ pt: 2, pb: 4, px: 4 }}
    sx={{ border: 'none' }}
    Header={({ radius }) => (
      <Flex
        sx={{
          p: 3,
          pl: 4,
          bg: 'headSection',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
          borderBottom: t => `1px solid ${t.colors.borders}`
        }}
      >
        { HeaderContent }
        { close ? <Close onClick={close} type="button" /> : null }
      </Flex>
    )}
    Footer={(
      <Flex sx={{ alignItems: 'space-between', bg: 'headSection', p: 3}}>
        <Box sx={{ ml: 'auto' }} />
        { FooterContent }
      </Flex>
    )}
  >
    { children }
  </Card>
)

export default DefaultCard