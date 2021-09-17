import { useState, useContext, useEffect } from 'react'
import { useToasts } from "react-toast-notifications";
import { useIsMounted } from 'react-tidy'

import { handleRemoteResponse } from "src/ToastProvider/utils";

import { SliceContext } from 'src/models/slice/context'
import { ConfigContext } from 'src/config-context'

import { createStorybookUrl } from '@lib/utils'

import {
  Box,
} from 'theme-ui'

import {
  FlexEditor,
  SideBar,
  Header,
} from './layout'

import FieldZones from './FieldZones'

const Builder = ({ openPanel }) => {
  const { Model, store, variation } = useContext(SliceContext)
  const { env: { userConfig: { storybook: storybookBaseUrl } }, warnings } = useContext(ConfigContext)
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

  const storybookUrl = createStorybookUrl({ storybook: storybookBaseUrl, libraryName: from, sliceName, variationId: variation.id })

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
      if (isMounted) {
        handleRemoteResponse(addToast)(data)
      }
    }
  }, [data])

  useEffect(() => {
    return () => store.reset()
  }, [])

  return (
    <Box>
      <Header
        Model={Model}
        store={store}
        variation={variation}
        onPush={ () => store.push(Model, setData) }
        onSave={ () => store.save(Model, setData) }
        isLoading={data.loading}
      />
      <FlexEditor
        sx={{ py: 4 }}
        SideBar={<SideBar
          data={data}
          Model={Model}
          variation={variation}
          warnings={warnings}
          openPanel={openPanel}
          onPush={ () => store.push(Model, setData) }
          onSave={ () => store.save(Model, setData) }
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