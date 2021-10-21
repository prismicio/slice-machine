export { getStaticProps, getStaticPaths } from 'simple-story-next-poc/build/server'
import { default as SimpleStory } from 'simple-story-next-poc'

import resolver from '../sm-resolver'

const Preview = (props) => {
  return (
    <SimpleStory {...props} resolver={resolver} />
  )
}

export default Preview
