import { mutate } from 'swr'
import { useState } from 'react'
import getConfig from 'next/config'
import {
  Box,
  Image,
  Spinner,
  Text,
  Alert,
  Close,
  Button
} from 'theme-ui'

const { publicRuntimeConfig: config } = getConfig();

export default ({
  storybookUrl,
  componentInfo,
  ...rest
}) => {

  const { sliceName, from, previewUrl } = componentInfo
  const [data, setData] = useState({
    loading: false,
    done: false,
    error: null,
  });

  const generatePreview = async () => {
    setData({
      loading: true,
      done: false,
      error: null
    })
    fetch(`/api/generate-preview?sliceName=${sliceName}&from=${from}&url=${storybookUrl}`, {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',

      },
    }).then((res) => {
      setData({ loading: false, done: true, error: null })
      mutate('/api/components')
    }).catch(err => {
      console.error(err)
      setData({ loading: false, done: false, error: err })
    })
  }

 return (
   <Box sx={{ border: t => `1px solid ${t.colors.primary}`, p: 4 }}>
     {
       previewUrl
        ? (<Image src={previewUrl} {...rest} />)
        : (
          <Text>No preview!</Text>
        )
     }
     <Button onClick={generatePreview}>
       Generate Preview
     </Button>
     { data.loading ? <Spinner /> :null}
     {
          data.error ? (
            <Alert
              mt={2}
              variant="muted"
            >
              Could not generate preview. See console for full error.
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
              Preview was generated!
              <Close ml='auto' mr={-2} onClick={() => setData({ ...data, error: null, done: false })} />
            </Alert>
          ) : null
        }
   </Box>
 )
}