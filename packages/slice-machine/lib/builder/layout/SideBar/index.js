import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Image,
  Spinner
} from 'theme-ui'

import Card from 'components/Card'

import Prismic from './icons/prismic.svg'
import Storybook from './icons/storybook.svg'

const borderBottom = '1px solid #F7F7F7'

const Li = ({ Icon, title, description, bodySx, ...rest }) => (
  <Flex
    as="li"
    sx={{
      p: 3,
      borderBottom,
      alignItems: "center",
      textDecoration: 'none',
      color: 'inherit'
    }}
    {...rest}
  >
    <Box mr={3}>
      <Icon />
    </Box>
    <Box sx={bodySx}>
      <Heading as="h5">{title}</Heading>
      <Text as="p" variant="xs">{description}</Text>
    </Box>
  </Flex>
);

const FooterButton = ({ info, isTouched, onSave, onPush, loading }) => {
  const text = (() => {
    if (isTouched) {
      return 'Save model to filesystem'
    }
    return 'Push Slice to Prismic'
  })()
  
  const onClick = isTouched ? onSave : onPush

  const editable = info.isNew || isTouched || info.isModified

  return (
    <Flex
      as={Button}
      sx={{
        width: '100%',
        borderTopRightRadius: '0',
        borderTopLeftRadius: '0',
        cursor: 'pointer',
        p: 3,
        alignItems: 'center',
        justifyContent: 'center'
      }}
      variant={editable ? 'buttons.primary' : 'buttons.disabled'}
      disabled={!editable}
      onClick={editable ? onClick : null}
    >
       { loading ? <Spinner color="#F7F7F7" size={24} mr={2} /> : null } {text}
    </Flex>
  )

}

const SideBar = ({
  info,
  data,
  isTouched,
  onSave,
  onPush,
  storybookUrl,
  previewUrl
}) => {

  return (
    <Box
      sx={{
        pl: 3,
        flexGrow: 1,
        flexBasis: 'sidebar',
      }}
    >
      <Card
        bg="#FFF"
        bodySx={{ p: 0 }}
        footerSx={{ p: 0 }}
        Footer={() => (
          <FooterButton
            info={info}
            isTouched={isTouched}
            onSave={onSave}
            onPush={onPush}
            loading={data.loading}
          />
        )}
      >
        <Image src={previewUrl} />
          <ul>
            <Li
              title="Open in Storybook"
              description="Work locally with your component"
              Icon={Storybook}
              as="a"
              href={storybookUrl}
              target="_blank"
            />
            {/* <Li
              title="Generate a sample page"
              description="See your component in the context of a page"
              Icon={Storybook}
            />
            <Li
              title="Used in 4 custom types"
              description="View these 4 custom types"
              Icon={Prismic}
            /> */}
          </ul>
      </Card>
    </Box>
  )
}

export default SideBar

/**<Box
      sx={{
        pl: 3,
        flexGrow: 1,
        flexBasis: 'sidebar',
      }}
      as="aside"
      >
      {/* <Box mb={3}>
        <Heading as="h2">
          {title}
        </Heading>
        <Text as="p">
          { description }
        </Text>
      </Box> 
} <
Box
  >
  <
  Card sx = {
    {
      border: '1px solid #F1F1F1',
      bg: '#FFF'
    }
  } >

  <
  Button
sx = {
  {
    width: '100%',
    borderTopRightRadius: '0',
    borderTopLeftRadius: '0',
    cursor: 'pointer'
  }
}
onClick = {
    onPush
  } >
  Push to Prismic <
  /Button> <
  /Card> <
  /Box> <
  /Box> */