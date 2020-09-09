import { mutate } from 'swr'
import { useState, useContext, useEffect } from 'react'
import { ModelContext } from 'src/model-context'

import {
  Box,
} from 'theme-ui'

import { Drawer, NavBar, FlexEditor, SideBar } from './layout'

import PreviewFields from './modules/PreviewFields'

import getConfig from 'next/config'

const { publicRuntimeConfig: config } = getConfig()

const createOnSaveUrl = ({
  sliceName,
  from,
  value,
  screenshotUrl
}) =>
  `/api/update-model?sliceName=${sliceName}&from=${from}&model=${btoa(JSON.stringify(value))}&screenshotUrl=${screenshotUrl}`

const createStorybookUrls = (componentInfo, variation = 'default-slice') => ({
  screenshotUrl: `${config.storybook}/iframe.html?id=${componentInfo.sliceName.toLowerCase()}--${variation}&viewMode=story`,
  storybookUrl: `${config.storybook}/?path=/story/${componentInfo.sliceName.toLowerCase()}--${variation}`
})

const Builder = () => {
  const [isOpen, setIsOpen] = useState(false)

  const Model = useContext(ModelContext)
  const {
    info,
    isTouched,
    value,
    hydrate,
    resetInitialModel,
  } = Model

  const [data, setData] = useState({
    loading: false,
    done: false,
    error: null,
    pushState: info.isNew || info.isModified
  })

  console.log({ pushState: data.pushState })

  const variation = Model.get().variation()

  const { screenshotUrl, storybookUrl } = createStorybookUrls(info, variation.id)

  const onSave = () => {
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
      const newInfo = await res.json()
      hydrate(resetInitialModel(value, newInfo))
      mutate('/api/components')
      setData({ loading: false, done: true, error: null })
    }).catch(err => {
      console.error(err)
      setData({ loading: false, done: false, error: err })
    })
  }

  useEffect(() => {
    if (isTouched) {
      setData({ loading: false, done: false, error: null })
    }
  }, [isTouched])

  const onPush = () => setIsOpen(true)

  const push = () => {
    fetch(`/api/push?sliceName=${info.sliceName}&from=${info.from}&create=${info.isNew}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',

      },
    }).then(async res => {
      const newInfo = await res.json()
      hydrate(resetInitialModel(value, newInfo))
      mutate('/api/components')
    })
    .catch(console.log)
  }

  return (
    <Box>
      <NavBar
        from={info.from}
        onSave={onSave}
        data={data}
        setData={setData}
      />
      <FlexEditor
        sx={{ py: 4 }}
        SideBar={() => (
          <SideBar
            isTouched={isTouched}
            info={info}
            onPush={onPush}
            onSave={onSave}
            previewUrl={info.previewUrl}
            storybookUrl={storybookUrl}
          />
        )}
      >
        <Box ml={4}>
          <PreviewFields Model={Model} variation={variation} storybookUrl={storybookUrl} />
        </Box>
      </FlexEditor>
      <Drawer
        isOpen={isOpen}
        push={push}
        onClose={() => setIsOpen(false)}
      />
      {/* {
        data.done ? (
          <SuccessModal previewUrl={info.previewUrl} />
        ) : null
      } */}
    </Box>
  )
}

export default Builder