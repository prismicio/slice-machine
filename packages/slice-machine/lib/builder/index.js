import { mutate } from 'swr'
import { useState, useContext, useEffect } from 'react'
import { ModelContext } from 'src/model-context'
import { ConfigContext } from 'src/config-context'
import { useIsMounted } from 'react-tidy'

import Header from './layout/Header'

import {
  Box,
  Flex,
  Button
} from 'theme-ui'

import {
  FlexEditor,
  SideBar,
  Success
} from './layout'

import PreviewFields from './modules/PreviewFields'

const createOnSaveUrl = ({
  sliceName,
  from,
  value,
}) =>
  `/api/update?sliceName=${sliceName}&from=${from}&model=${btoa(JSON.stringify(value))}`

const createStorybookUrls = (storybook, componentInfo, variation = 'default-slice') => ({
  storybookUrl: `${storybook}/?path=/story/${componentInfo.sliceName.toLowerCase()}--${variation}`
})

const Builder = ({ openPanel }) => {
  const [displaySuccess, setDisplaySuccess] = useState(false)
  const Model = useContext(ModelContext)
  const { env: { storybook }, warnings } = useContext(ConfigContext)
  const {
    info,
    isTouched,
    value,
    hydrate,
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

  const variation = Model.get().variation()

  const { storybookUrl } = createStorybookUrls(storybook, info, variation.id)

  const onSave = async () => {
    setData({ loading: true, done: false, error: null })
    fetch(createOnSaveUrl({
      ...info,
      value,
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
      mutate('/api/state')
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
      if (isMounted) {
        setData({ loading: false, done: false, error: null })
      }
    }
  }, [isTouched])

  // activate/deactivate Success message
  useEffect(() => {
    if (data.done) {
      setDisplaySuccess(true)
      setTimeout(() => {
        if (isMounted) {
          setDisplaySuccess(false)
          setData({ ...data, done: false })
        }
      }, 2500)
    } else {
      if (isMounted) {
        setDisplaySuccess(false)
      }
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
      mutate('/api/state')
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
    fetch(`/api/screenshot?sliceName=${info.sliceName}&from=${info.from}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
      mutate('/api/state')
      hydrate(appendInfo(json))
    })
  }

  const onCustomScreenshot = (base64Img) => {
    setData({
      ...data,
      imageLoading: true,
    })
    fetch(`/api/custom-screenshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sliceName: info.sliceName,
        from: info.from,
        img: base64Img
      })
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
      mutate('/api/state')
      hydrate(appendInfo(json))
    })
  }

  return (
    <Box>
      <Header info={info} Model={Model} />

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
            warnings={warnings}
            openPanel={openPanel}
            previewUrl={info.previewUrl}
            storybookUrl={storybookUrl}
            onScreenshot={onScreenshot}
            onHandleFile={onCustomScreenshot}
            imageLoading={data.imageLoading}
          />
        )}
      >
        <Box>
          <PreviewFields Model={Model} variation={variation} />
        </Box>
      </FlexEditor>
    </Box>
  )
}

export default Builder