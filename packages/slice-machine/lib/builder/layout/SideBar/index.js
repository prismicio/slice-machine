import { memo } from 'react'
import { Box } from 'theme-ui'

import Card from 'components/Card'

import Storybook from './icons/storybook.svg'
import StorybookGrey from './icons/storybookGrey.svg'
import Li from './components/Li'
import ImagePreview from './components/ImagePreview'
import FooterButton from './components/FooterButton'
import { storybookWarningStates, warningTwoLiners } from '../../../consts'

const MemoizedImagePreview = memo(ImagePreview)

const SideBar = ({
  Model,
  data,
  onSave,
  onPush,
  warnings,
  openPanel,
  imageLoading,
  onScreenshot,
  onHandleFile,
  storybookUrl,
}) => {
  const {
    isCustomPreview,
    previewUrl,
    isTouched,
    __status,
  } = Model

  const storybookError = warnings.find(w => storybookWarningStates.includes(w.key))

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
            onSave={onSave}
            onPush={onPush}
            __status={__status}
            isTouched={isTouched}
            loading={data.loading}
          />
        )}
      >
        <MemoizedImagePreview
          src={previewUrl}
          imageLoading={imageLoading}
          onScreenshot={onScreenshot}
          onHandleFile={onHandleFile}
          preventScreenshot={!!storybookError}
        />
        <ul>
          {
            storybookError ? (
              <Li
                title={storybookError.title}
                hasError
                description={storybookError.description}
                Icon={StorybookGrey}
                onClick={() => openPanel(storybookError)}
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
