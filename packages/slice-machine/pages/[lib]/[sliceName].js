import { useContext, useState } from "react";
import { LibContext } from "../../src/lib-context";
import getConfig from 'next/config'
import ImagePreview from "../../components/ImagePreview";

import { createInitialValues } from "../../lib/forms";
import * as Widgets from '../../lib/widgets'

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

const canParse = (str) => {
  try {
    const json = JSON.parse(str)
    return true
  } catch (e) {
    return false
  }
}

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

  const { sliceName, from, previewUrl, model: initialModel } = component
  const [model, setModel] = useState(JSON.stringify(initialModel, null, 2));
  const [data, setData] = useState({
    loading: false,
    done: false,
    error: null
  })
  const updateModel = async (component, model) => {
    setData({
      loading: true,
      done: false,
      error: null
    })
    fetch(`/api/update-model?sliceName=${component.sliceName}&from=${component.from}&model=${model}`, {
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

  return (
    <FlexEditor SideBar={() => (
      <Box mt={2}>
        <Heading mb={2}>Storybook Preview</Heading>
        <iframe src={iframeSrc(component)} style={{ border: 'none', width: '100%', height: '100vh' }} />
      </Box>
    )}>
      <Heading as="h2">{sliceName}</Heading>
      <Text as="p">in <b>{from}</b></Text>
      <Box mt={0}>
        <Heading mb={2}>Prismic Preview</Heading>
        <ImagePreview componentInfo={component} previewUrl={previewUrl}/>
      </Box>
      <Box mt={4}>
        <Heading mb={2}>JSON model</Heading>
        <Input
          as="textarea"
          value={canParse(model) ? JSON.parse(JSON.stringify(model, null, 2)) : model}
          onChange={e => {
            const { value } = e.target
            if (canParse(value)) {
              return setModel(JSON.stringify(JSON.parse(value), null, 2));
            }
            setModel(value)
          }}
          rows={10}
        />
        {
          Object.entries(Widgets).map(([name, widget]) => {
            const { Meta, FormFields } = widget
            if (Meta) {
              return (
                <Box my={2} bg="muted">
                  <Heading>{Meta.title}</Heading>
                  <Text as="p">{Meta.description}</Text>
                  <Button onClick={e => {
                    if (canParse(model)) {
                      console.log(model, typeof model)
                      setModel(JSON.stringify({
                        ...model,
                        primary: {
                          ...model.primary,
                          myAwesomeField: Object.assign(createInitialValues(FormFields))
                        }
                      }))
                      return
                    }
                    console.log('CANNOT PARSE MODEL')
                  }}>Add</Button>
                </Box>
              )
            }
            return null
          })
        }
        <Button
          disabled={!canParse(model)}
          bg={!canParse(model) ? 'text' : 'primary'}
          onClick={() => updateModel(component, model)}
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
    </FlexEditor>
  )
}

SliceEditor.getInitialProps = ({ query }) => {
  return {
    query
  }
};

export default SliceEditor