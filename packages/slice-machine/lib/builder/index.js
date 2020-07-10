import Container from '../../components/Container'

import PreviewFields from "./components/PreviewFields"
import FieldAdders from "./components/FieldAdders"

import FlexEditor from '../../components/FlexEditor'

const Builder = ({ Model }) => {
  return (
    <Container>
      <PreviewFields Model={Model} />
    </Container>
  )
}

export default Builder