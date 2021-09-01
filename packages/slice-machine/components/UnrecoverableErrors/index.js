import { Text } from 'theme-ui'
import FullPage from 'components/FullPage'

const Code = ({ children }) => (
  <Text variant="styles.inlineCode" sx={{ fontSize:'16px' }}>
    { children }
  </Text>
)

const Pre = ({ children }) => (
  <pre style={{ fontSize: '15px', background: '#F1F1F1' }}>
    { children }
  </pre>
)

export const LacksStorybookConf = ({ env }) => {
  return (
    <FullPage>
      <div style={{ maxWidth: '850px', textAlign:'center', color:'#25252D' }}>
        <img src="/logo.png" width="40px" />
        <h2>Welcome to the new 
          Prismic studio 🎉🎉 </h2>
        <Text as="p" style={{ lineHeight: '30px', fontSize: '18px'}}>
          To make your project work with the new builder, you must update your Storybook config file.
          This is because Slice stories have moved from <Code>{'~/[your-lib]/...'}</Code> to <Code>{'~/.slicemachine/assets'}</Code>.
          <br/><br/>
          We have already moved your files for you, but you must update your Storybook options.
        </Text>
        <h4 style={{ marginBottom: '16px'}}>1. Import the helper</h4>
        <Text>
          Open <Code>{ env.framework == "nuxt" ? 'nuxt.config.js' : '.storybook/main.js' }</Code> and add:
          <Pre>{`const { getStoriesPaths } = require('slice-machine-ui/helpers/storybook')`}</Pre>
        </Text>
        <h4 style={{ marginBottom: '16px'}}>2. Use the function in stories array</h4>
        <Text>
          <Pre>{`stories: [...getStoriesPaths(), /*...*/]`}</Pre>
        </Text>
        {env.framework == "nuxt" ? <img src="/nuxt-storybook.png" /> : <img src="/next-storybook.png" />}
      </div>
    </FullPage>
  )
}
