import {
  Alert,
  Close,
  Text
} from 'theme-ui'
import { Fragment } from 'react'

const AfterSave = ({
  data,
  setData
}) => (
  <Fragment>
    {
      data.error ? (
        <Alert py={0} px={2} mr={2}>
          <Text as="p" variant="small">Could not update model. See console for full error.</Text>
          <Close ml='auto' mr={-2} onClick={() => setData({ ...data, error: null, done: false })} />
        </Alert>
      ) : null
    }
    {
      data.done ? (
        <Alert py={0} px={2} mr={2}>
          <Text as="p" variant="small">Correctly updated! Mocks have been generated succesfully</Text>
          <Close ml='auto' mr={-2} onClick={() => setData({ ...data, error: null, done: false })} />
        </Alert>
      ) : null
    }
  </Fragment>
)

export default AfterSave