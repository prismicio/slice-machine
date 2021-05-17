import { useState, useContext, useEffect } from 'react'
import { useToasts } from "react-toast-notifications";
import { useIsMounted } from 'react-tidy'

import { handleRemoteResponse } from "src/ToastProvider/utils";

import { SliceContext } from 'src/models/slice/context'
import { ConfigContext } from 'src/config-context'

import { hyphenate } from 'lib/utils/str'

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

import FieldZones from './FieldZones'

const createStorybookUrls = (storybookBaseUrl, libraryName, sliceName, variation = 'default-slice') => ({
  storybookUrl: `${storybookBaseUrl}/?path=/story/${hyphenate(libraryName)}-${sliceName.toLowerCase()}--${hyphenate(variation)}`
})

const Builder = ({ openPanel }) => {
  const [displaySuccess, setDisplaySuccess] = useState(false)
  const { Model, store, variation } = useContext(SliceContext)
  const { env: { userConfig: { storybook: storybookBaseUrl } }, warnings } = useContext(ConfigContext)
  const {
    infos: {
      sliceName,
      previewUrls,
    },
    from,
    isTouched,
  } = Model

  const { addToast } = useToasts()

  const isMounted = useIsMounted()
  // we need to move this state to somewhere global to update the UI if any action from anywhere save or update to the filesystem I'd guess
  const [data, setData] = useState({
    imageLoading: false,
    loading: false,
    done: false,
    error: null,
  })

  const { storybookUrl } = createStorybookUrls(storybookBaseUrl, from, sliceName, variation.id)

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
          handleRemoteResponse(addToast)(data);
        }
      }, 6500)
    }
  }, [data])

  useEffect(() => {
    return () => store.reset()
  }, [])

  return (
    <Box>
      <Header Model={Model} store={store} variation={variation} />
      <FlexEditor
        sx={{ py: 4 }}
        SideBar={<SideBar
          data={data}
          Model={Model}
          variation={variation}
          onPush={ () => store.push(Model, setData) }
          onSave={ () => store.save(Model, setData) }
          warnings={warnings}
          openPanel={openPanel}
          previewUrl={previewUrls[variation.id]}
          storybookUrl={storybookUrl}
          onScreenshot={() => store.variation(variation.id).generateScreenShot(Model.from, Model.infos.sliceName, setData) }
          onHandleFile={(file) => store.variation(variation.id).generateCustomScreenShot(Model.from, Model.infos.sliceName, setData, file)}
          imageLoading={data.imageLoading}
        />}
      >
        <FieldZones
          Model={Model}
          store={store}
          variation={variation}
        />

      </FlexEditor>
    </Box>
  )
}

export default Builder