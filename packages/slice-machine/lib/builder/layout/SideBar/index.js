import {
  Box,
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
        bg="headSection"
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
        </ul>
      </Card>
    </Box>
  )
}

export default SideBar
