import { Flex, Box, Close } from 'theme-ui'
import Card from './'

const DefaultCard = ({
  children,
  FooterContent = null,
  HeaderContent,
  close,
  sx = {},
  headerSx = {}
}) => (
  <Card
    borderFooter
    footerSx={{ p: 0 }}
    bodySx={{ pt: 2, pb: 4, px: 4 }}
    sx={{ border: 'none', ...sx }}
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
          borderBottom: t => `1px solid ${t.colors?.borders}`,
          ...headerSx,
        }}
      >
        { HeaderContent }
        { close ? <Close onClick={close} type="button" /> : null }
      </Flex>
    )}
    Footer={FooterContent ? (
      <Flex sx={{ alignItems: 'space-between', bg: 'headSection', p: 3}}>
        <Box sx={{ ml: 'auto' }} />
        { FooterContent }
      </Flex>
    ) : null}
  >
    { children }
  </Card>
)

export default DefaultCard