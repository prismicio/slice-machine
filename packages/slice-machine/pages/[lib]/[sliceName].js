import { useContext, useState, Fragment } from "react";
import { LibContext } from "../../src/lib-context";
import getConfig from 'next/config'
import ImagePreview from "../../components/ImagePreview";

import * as Widgets from '../../lib/widgets'

import Builder from '../../lib/builder'
import createModel from '../../lib/model'

import FlexEditor from "../../components/FlexEditor"

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
  const Model = createModel(initialModel)

  const [data, setData] = useState({
    loading: false,
    done: false,
    error: null
  })

  const updateModel = async (component) => {
    setData({
      loading: true,
      done: false,
      error: null
    })
    fetch(`/api/update-model?sliceName=${component.sliceName}&from=${component.from}&model=${JSON.stringify(Model.get())}`, {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',

      },
    }).then((res) => {
      setData({ loading: false, done: true, error: null })
    }).catch(err => {
      console.error(err)
      setData({ loading: false, done: false, error: err })
    })
  }

  const storybookUrl = iframeSrc(component);
  return (
    <Fragment>
    <FlexEditor SideBar={() => (
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
    </FlexEditor>
    <Builder Model={Model} />
    <Box mb={4} ml={6}>
        <Button
          onClick={() => updateModel(component)}
        >
          Update
        </Button>
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
  )
}

SliceEditor.getInitialProps = ({ query }) => {
  return {
    query
  }
};

export default SliceEditor