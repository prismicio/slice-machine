import { mutate } from 'swr'
import { useState, useContext, useEffect } from 'react'
import { useIsMounted } from 'react-tidy'

import { SliceContext } from 'src/models/slice/context'
import { ConfigContext } from 'src/config-context'

import { fetchApi } from './fetch'

import {
  Box,
  Label,
  Checkbox
} from 'theme-ui'

import {
  FlexEditor,
  SideBar,
  Header,
  Success
} from './layout'

import PreviewFields from './modules/PreviewFields'
import MockModal from './modules/MockModal'

const createStorybookUrls = (storybookBaseUrl, sliceName, variation = 'default-slice') => ({
  storybookUrl: `${storybookBaseUrl}/?path=/story/${sliceName.toLowerCase()}--${variation}`
})

const Builder = ({ openPanel }) => {
  const [displaySuccess, setDisplaySuccess] = useState(false)
  const { Model, store, variation } = useContext(SliceContext)
  const { env: { storybook: storybookBaseUrl }, warnings } = useContext(ConfigContext)
  const {
    infos: {
      sliceName,
      previewUrl,
    },
    jsonModel,
    variations,
    from,
    value,
    hydrate,
    isTouched,
    isModified,
    mockConfig,
    appendInfo,
    resetInitialModel,
  } = Model

  const isMounted = useIsMounted()
  const [data, setData] = useState({
    imageLoading: false,
    loading: false,
    done: false,
    error: null,
  })

  const { storybookUrl } = createStorybookUrls(storybookBaseUrl, sliceName, variation.id)

  useEffect(() => {
    if (isTouched) {
      if (isMounted) {
        setData({ loading: false, done: false, error: null })
      }
    }
  }, [isTouched])

  // activate/deactivate Success message
  useEffect(() => {
    if (data.done && isMounted) {
      setDisplaySuccess(true)
      setTimeout(() => {
        if (isMounted) {
          setDisplaySuccess(false)
          setData({ ...data, done: false })
        }
      }, 6500)
    } else {
      if (isMounted) {
        setDisplaySuccess(false)
      }
    }
  }, [data])

  useEffect(() => {
    return () => store.reset()
  }, [])

  const onCloseSuccess = () => {
    if (isMounted) {
      setDisplaySuccess(false)
      setData({ ...data, done: false })
    }
  }

  const DEFAULT_CHECKED = false;
  const [showHints, setShowHints] = useState(DEFAULT_CHECKED);
  const onToggleHints = () => setShowHints(!showHints);
  return (
    <Box>
      <Header Model={Model} store={store} variation={variation} />

      <Success
        data={data}
        onClose={onCloseSuccess}
        display={displaySuccess}
      />
      <FlexEditor
        sx={{ py: 4 }}
        SideBar={<SideBar
            data={data}
            Model={Model}
            onPush={ () => store.push(Model, setData) }
            onSave={ () => store.save(Model, setData) }
            warnings={warnings}
            openPanel={openPanel}
            previewUrl={previewUrl}
            storybookUrl={storybookUrl}
            onScreenshot={() => store.generateScreenShot(Model, setData)}
            onHandleFile={(file) => store.generateCustomScreenShot(Model, setData, file)}
            imageLoading={data.imageLoading}
          />}
      >

        <Label variant="hint" sx={{ justifyContent: 'flex-end', py: 2, px: 0 }}>
          Show code snippets
          <Checkbox
            sx={{ margin: '0 8px' }}
            defaultChecked={DEFAULT_CHECKED}
            onChange={onToggleHints}
          />
        </Label>
        
          <PreviewFields
            Model={Model}
            store={store}
            variation={variation}
            showHints={showHints}
          />

      </FlexEditor>
      {
        false ? (
          <MockModal
            close={console.log}
            variation={variation}
            Model={Model}
          />
        ) : null
      }
    </Box>
  )
}

export default Builder