import { useContext } from "react";
import { LibContext } from "../../src/lib-context";
import Container from "../../components/Container";
import ImagePreview from "../../components/ImagePreview";

import {
  Heading,
  Text,
  Box,
  Image
} from 'theme-ui'

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

  const { sliceName, from, hasPreview, previewUrl } = component

  return (
    <Container>
      <Heading as="h2">{sliceName}</Heading>
      <Text as="p">in <b>{from}</b></Text>
      <Box mt={4}>
        <ImagePreview componentInfo={component} previewUrl={previewUrl}/>
      </Box>
    </Container>
  )
  
  
}

SliceEditor.getInitialProps = ({ query }) => {
  console.log({ query })

  return {
    query
  }
};

export default SliceEditor