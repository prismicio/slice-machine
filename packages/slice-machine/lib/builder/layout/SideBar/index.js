import {
  Box,
} from 'theme-ui'

import Card from 'components/Card'

import Storybook from './icons/storybook.svg'
import StorybookGrey from './icons/storybookGrey.svg'
import Li from './components/Li'
import ImagePreview from './components/ImagePreview'
import FooterButton from './components/FooterButton'
import { storybookWarningStates, warningTwoLiners } from 'src/consts'

const SideBar = ({
  info,
  data,
  isTouched,
  onSave,
  onPush,
  warnings,
  openPanel,
  storybookUrl,
  imageLoading,
  onScreenshot,
  previewUrl
}) => {

  const maybeStorybookError = warnings.find(e => storybookWarningStates.includes(e))
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
          {
            maybeStorybookError ? (
              <Li
                title={warningTwoLiners[maybeStorybookError][0]}
                hasError
                description={warningTwoLiners[maybeStorybookError][1]}
                Icon={StorybookGrey}
                onClick={() => openPanel(maybeStorybookError)}
                sx={{ cursor: 'pointer' }}
              />
            ) : (
              <Li
                title="Open in Storybook"
                description="Work locally with your component"
                Icon={Storybook}
                as="a"
                href={storybookUrl}
                target="_blank"
              />
            )
          }
        </ul>
      </Card>
    </Box>
  )
}

export default SideBar
