import { useState, useContext } from 'react'

import { ModelContext } from 'src/model-context'

import {
  Box,
  Alert,
  Close
} from 'theme-ui'

import { Drawer, NavBar, FlexEditor, SideBar } from './layout'

import PreviewFields from './components/PreviewFields'

const createOnSaveUrl = ({ sliceName, from, value }) =>
  `/api/update-model?sliceName=${sliceName}&from=${from}&model=${btoa(JSON.stringify(value))}`

const Builder = ({ Model }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState({ loading: false, done: false, error: null })

  const {
    info: {
      from,
      sliceName,
    },
    isTouched,
    value,
    hydrate,
    resetInitialModel
  } = useContext(ModelContext)

  const onSave = () => {
    setData({ loading: true, done: false, error: null })
    fetch(createOnSaveUrl({ sliceName, from, value }), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',

      },
    }).then((res) => {
      hydrate(resetInitialModel(value))
      setData({ loading: false, done: true, error: null })
    }).catch(err => {
      console.error(err)
      setData({ loading: false, done: false, error: err })
    })
  }

  const onPush = () => setIsOpen(true)

  return (
    <Box>
      <NavBar
        isTouched={isTouched}
        onSave={onSave}
        data={data}
        setData={setData}
      />
      <FlexEditor
        sx={{ py: 4 }}
        SideBar={() => <SideBar onPush={onPush} />}
      >
        <Box ml={4}>
          <PreviewFields Model={Model} />
        </Box>
      </FlexEditor>
      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </Box>
  )
}

export default Builder