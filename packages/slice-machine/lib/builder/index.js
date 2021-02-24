import { mutate } from 'swr'
import { useState, useContext, useEffect } from 'react'
import { useIsMounted } from 'react-tidy'

import { SliceContext } from 'src/models/slice/context'
import { ConfigContext } from 'src/config-context'

import { fetchApi } from './fetch'

import { formatModel } from 'src/models/helpers'

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
  const { Model, store } = useContext(SliceContext)
  const { env: { storybook: storybookBaseUrl }, warnings } = useContext(ConfigContext)
  const {
    from,
    sliceName,
    previewUrl,
    value,
    hydrate,
    isTouched,
    isModified,
    mockConfig,
    appendInfo,
    jsonModel,
    variations,
    resetInitialModel,
  } = Model

  const isMounted = useIsMounted()
  const [data, setData] = useState({
    imageLoading: false,
    loading: false,
    done: false,
    error: null,
  })

  const variation = variations[0]

  const { storybookUrl } = createStorybookUrls(storybookBaseUrl, sliceName, variation.id)


  console.log('previewUrl: ', previewUrl)

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
    return () => console.log('UNMOUNT')//store.reset()
  }, [])

  const onCloseSuccess = () => {
    if (isMounted) {
      setDisplaySuccess(false)
      setData({ ...data, done: false })
    }
  }


  const onSave = async () => {
    fetchApi({
      url: '/api/update',
      fetchparams: {
        method: 'POST',
        body: JSON.stringify({
          sliceName: sliceName,
          from: from,
          model: formatModel(jsonModel, variations),
          mockConfig
        })
      },
      setData,
      successMessage: 'Model & mocks have been generated succesfully!',
      onSuccess(json) {
        // console.log({ json })
        // // hydrate(() => resetInitialModel(value, json, mockConfig))
        mutate('/api/state')
      }
    })
  }

  const onPush = async () => {
    fetchApi({
      url: `/api/push?sliceName=${sliceName}&from=${from}`,
      setData,
      successMessage: 'Model was correctly saved to Prismic!',
      onSuccess(json) {
        // hydrate(() => resetInitialModel(value, json, mockConfig))
        mutate('/api/state')
      }
    })
  }

  const onScreenshot = async () => {
    fetchApi({
      url: `/api/screenshot?sliceName=${sliceName}&from=${from}`,
      setData,
      setDataParams: [{ imageLoading: true }, { imageLoading: false }],
      successMessage: 'New screenshot added!',
      onSuccess({ previewUrl }) {
        // console.log({ previewUrl })
        store.onScreenshot(previewUrl)
        // mutate('/api/state', { ...Model, previewUrl })
        // hydrate(appendInfo(json))
      }
    })
  }

  const onCustomScreenshot = async (file) => {
    const form = new FormData()
    Object.entries({ sliceName: sliceName, from: from })
      .forEach(([key, value]) => form.append(key, value))
    form.append('file', file)
    fetchApi({
      url: '/api/custom-screenshot',
      setData,
      fetchparams: {
        method: 'POST',
        body: form,
        headers: {}
      },
      setDataParams: [{ imageLoading: true }, { imageLoading: false }],
      successMessage: 'New screenshot added!',
      onSuccess(json) {
        hydrate(appendInfo(json))
      }
    })
  }
  const DEFAULT_CHECKED = false;
  const [showHints, setShowHints] = useState(DEFAULT_CHECKED);
  const onToggleHints = () => setShowHints(!showHints);

  return (
    <Box>
      <Header Model={Model} />

      <Success
        data={data}
        onClose={onCloseSuccess}
        display={displaySuccess}
      />
      <button onClick={store.reset}>reset</button>
      <button onClick={store.save}>Save state</button>
      <br/>
      Status: { Model.status }
      <br/>
      {
        isTouched ? 'isTouched': 'isNotTouched'
      }<br/>
      <FlexEditor
        sx={{ py: 4 }}
        SideBar={<SideBar
            data={data}
            Model={Model}
            onPush={onPush}
            onSave={onSave}
            warnings={warnings}
            openPanel={openPanel}
            previewUrl={previewUrl}
            storybookUrl={storybookUrl}
            onScreenshot={onScreenshot}
            onHandleFile={onCustomScreenshot}
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