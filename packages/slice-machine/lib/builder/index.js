import { mutate } from 'swr'
import { useState, useContext, useEffect } from 'react'
import { ModelContext } from 'src/model-context'
import { ConfigContext } from 'src/config-context'

import { Box } from 'theme-ui'

import {
  NavBar,
  FlexEditor,
  SideBar,
  Success
} from './layout'

import PreviewFields from './modules/PreviewFields'

const createOnSaveUrl = ({
  sliceName,
  from,
  value,
  screenshotUrl
}) =>
  `/api/update?sliceName=${sliceName}&from=${from}&model=${btoa(JSON.stringify(value))}&screenshotUrl=${screenshotUrl}`

const createStorybookUrls = (storybook, componentInfo, variation = 'default-slice') => ({
  screenshotUrl: `${storybook}/iframe.html?id=${componentInfo.sliceName.toLowerCase()}--${variation}&viewMode=story`,
  storybookUrl: `${storybook}/?path=/story/${componentInfo.sliceName.toLowerCase()}--${variation}`
})

const Builder = () => {
  const [displaySuccess, setDisplaySuccess] = useState(false)
  const Model = useContext(ModelContext)
  const { storybook } = useContext(ConfigContext)
  const {
    info,
    isTouched,
    value,
    hydrate,
    appendInfo,
    resetInitialModel,
  } = Model

  const [data, setData] = useState({
    imageLoading: false,
    loading: false,
    done: false,
    error: null,
  })

  const variation = Model.get().variation()

  const { screenshotUrl, storybookUrl } = createStorybookUrls(storybook, info, variation.id)

  const onSave = async () => {
    setData({ loading: true, done: false, error: null })
    fetch(createOnSaveUrl({
      ...info,
      value,
      screenshotUrl
    }), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',

      },
    }).then(async (res) => {
      if (res.status > 209) {
        const json = await res.json()
        return setData({
          loading: false,
          done: true,
          error: json.err,
          message: json.reason
        })
      }
      const newInfo = await res.json()
      hydrate(resetInitialModel(value, newInfo))
      mutate('/api/components')
      setData({
        loading: false,
        done: true,
        error: null,
        message: 'Model & mocks have been generated succesfully!'
      })
    })
  }

  useEffect(() => {
    if (isTouched) {
      setData({ loading: false, done: false, error: null })
    }
  }, [isTouched])

  // activate/deactivate Success message
  useEffect(() => {
    if (data.done) {
      setDisplaySuccess(true)
      setTimeout(() => {
        setDisplaySuccess(false)
        setData({ ...data, done: false })
      }, 2500)
    } else {
      setDisplaySuccess(false)
    }
  }, [data])

  
  const onPush = () => {
    setData({ loading: true, done: false, error: null })
    fetch(`/api/push?sliceName=${info.sliceName}&from=${info.from}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',

      },
    }).then(async res => {
      if (res.status > 209) {
        const json = await res.json()
        return setData({
          loading: false,
          done: true,
          error: json.err,
          message: 'An unexpected error occured while pushing slice to Prismic'
        })
      }
      const newInfo = await res.json()
      hydrate(resetInitialModel(value, newInfo))
      mutate('/api/components')
      setData({
        loading: false,
        done: true,
        error: null,
        message: 'Model was correctly saved to Prismic!'
      })
    })
  }

  const onScreenshot = () => {
    setData({
      ...data,
      imageLoading: true,
    })
    fetch(`/api/screenshot?sliceName=${info.sliceName}&from=${info.from}&screenshotUrl=${screenshotUrl}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // body: JSON.stringify({ sliceName, from, screenshotUrl })
    })
    .then(async res => {
      const json = await res.json()
      if (res.status > 209) {
        return setData({
          imageLoading: false,
          done: true,
          error: json.err,
          message: json.reason
        })
      }
      setData({
        imageLoading: false,
        done: true,
        error: null,
        message: 'New screenshot added!'
      })
      hydrate(appendInfo(json))
    })
  }

  return (
    <Box>
      <NavBar
        from={info.from}
        href={info.href}
        onSave={onSave}
        data={data}
        setData={setData}
      />
      <Success data={data} display={displaySuccess} />
      <FlexEditor
        sx={{ py: 4 }}
        SideBar={() => (
          <SideBar
            isTouched={isTouched}
            info={info}
            onPush={onPush}
            onSave={onSave}
            data={data}
            previewUrl={info.previewUrl}
            storybookUrl={storybookUrl}
            onScreenshot={onScreenshot}
            imageLoading={data.imageLoading}
            screenshotUrl={screenshotUrl}
          />
        )}
      >
        <Box ml={4}>
          <PreviewFields Model={Model} variation={variation} storybookUrl={storybookUrl} />
        </Box>
      </FlexEditor>
      {/* <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      /> */}
      {/* {
        data.done ? (
          <SuccessModal previewUrl={info.previewUrl} />
        ) : null
      } */}
    </Box>
  )
}

export default Builder