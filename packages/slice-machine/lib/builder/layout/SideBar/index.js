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

import Storybook from './icons/storybook.svg'
import Li from './components/Li'
import ImagePreview from './components/ImagePreview'
import FooterButton from './components/FooterButton'

const SideBar = ({
  info,
  data,
  isTouched,
  onSave,
  onPush,
  storybookUrl,
  imageLoading,
  onScreenshot,
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
        <ImagePreview imageLoading={imageLoading} src={previewUrl} onScreenshot={onScreenshot} />
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
