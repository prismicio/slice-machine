import { useContext, useState, Fragment } from "react";
import { LibContext } from "../../src/lib-context";
import ModelProvider from "../../src/model-context";
import getConfig from 'next/config'

import Builder from '../../lib/builder'

const { publicRuntimeConfig: config } = getConfig();

import {
  Heading,
  Text,
  Box,
  Input,
  Button,
  Alert,
  Close
} from 'theme-ui'

const iframeSrc = (component, variation = 'default-slice') =>
  `${config.storybook}/iframe.html?id=${component.sliceName.toLowerCase()}--${variation}&viewMode=story`

const SliceEditor = ({ query }) => {
  const libraries = useContext(LibContext)

  const lib = libraries.find(e => e[0] === query.lib)

  if (!lib) {
    return <div>Library not found</div>
  }

  const component = lib[1].find(e => e.sliceName === query.sliceName)

  if (!component) {
    return <div>Component not found</div>
  }

  const { sliceName, from, model: initialModel } = component

  const [data, setData] = useState({
    loading: false,
    done: false,
    error: null
  })

  const updateModel = async (component, Model) => {
    const { value } = Model.get()
    setData({
      loading: true,
      done: false,
      error: null
    })
    fetch(`/api/update-model?sliceName=${component.sliceName}&from=${component.from}&model=${JSON.stringify(value)}`, {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',

      },
    }).then((res) => {
      Model.resetInitialModel(value)
      setData({ loading: false, done: true, error: null })
    }).catch(err => {
      console.error(err)
      setData({ loading: false, done: false, error: err })
    })
  }

  const storybookUrl = iframeSrc(component);
  return (
    <ModelProvider initialModel={initialModel}>
      {(Model) => (
        <Fragment>
        {/* <FlexEditor SideBar={() => (
          <Box mt={2}>
            <Heading mb={2}>Storybook Preview</Heading>
            <iframe src={storybookUrl} style={{ border: 'none', width: '100%', height: '100vh' }} />
          </Box>
        )}>
          <Heading as="h2">{sliceName}</Heading>
          <Text as="p">in <b>{from}</b></Text>
          <Box mt={0}>
            <Heading mb={2}>Prismic Preview</Heading>
            <ImagePreview
              storybookUrl={storybookUrl}
              componentInfo={component}
            />
          </Box>
        </FlexEditor> */}
        <Button
          disabled={!Model.isTouched}
          sx={{ bg: Model.isTouched ? 'primary' : 'grey', position: 'fixed', right: '24px', top: '84px' }}
          onClick={() => Model.hydrate(Model.resetInitialModel(initialModel))}
        >
          Reset
        </Button>
        <Button
          onClick={() => updateModel(component, Model)}
          disabled={!Model.isTouched}
          sx={{ bg: Model.isTouched ? 'primary' : 'grey', position: 'fixed', right: '24px', top: '24px' }}
        >
          Save model
        </Button>
        <Builder />
        <Box mb={4} ml={6}>
            {
              data.error ? (
                <Alert
                  mt={2}
                  variant="muted"
                >
                  Could not update model. See console for full error.
                  <Close ml='auto' mr={-2} onClick={() => setData({ ...data, error: null, done: false })} />
                </Alert>
              ) : null
            }
            {
              data.done ? (
                <Alert
                  mt={2}
                  variant="muted"
                >
                  Correctly updated! Mocks have been generated succesfully
                  <Close ml='auto' mr={-2} onClick={() => setData({ ...data, error: null, done: false })} />
                </Alert>
              ) : null
            }
          </Box>
        </Fragment>
      )}
    </ModelProvider>
  )
}

SliceEditor.getInitialProps = ({ query }) => {
  return {
    query
  }
};

export default SliceEditor