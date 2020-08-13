import Container from '../../components/Container'

import PreviewFields from "./components/PreviewFields"

const Builder = ({ Model }) => {
  return (
    <Container>
      <PreviewFields Model={Model} />
    </Container>
  )
}

export default Builder