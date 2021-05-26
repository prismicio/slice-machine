import { Text } from 'theme-ui'
import FullPage from 'components/FullPage'

export const FetchError = ({ clientError }) => (
  <FullPage>
    <div>
      <h2>{clientError.reason}</h2>
      <p style={{ lineHeight: '30px', fontSize: '18px'}}>
        Possible reasons: your <Text variant="styles.inlineCode">sm.json</Text> file does not contain a valid <Text variant="styles.inlineCode">apiEndpoint</Text> value.<br/>
        Try to login to Prismic via the CLI (<Text variant="styles.inlineCode">prismic login</Text>) and that <br/><Text variant="styles.inlineCode">~/.prismic</Text> contains a <Text variant="styles.inlineCode">prismic-auth</Text> cookie.
      </p>
    </div>
  </FullPage>
)

export const NoLibraryConfigured = () => (
  <FullPage>
    <div>
      <h2>No library found</h2>
      <p style={{ lineHeight: '30px', fontSize: '18px'}}>
        Possible reasons: you did not define local libraries in your <Text variant="styles.inlineCode">sm.json</Text> file, eg. <Text variant="styles.inlineCode">{`{ "libraries": ["@/slices"] }`}</Text><br/>
        Once it's done, run <Text variant="styles.inlineCode">prismic sm --create-slice</Text>. You should now see your library on this page.
      </p>
    </div>
  </FullPage>
)

/**
 * To make your project work with the new builder, you must update your config file.This is because Slice stories have moved from ~/slices/
 to~/.slicemachine/assets / slices / .We have already moved your files
 for you, but you must update your Storybook options in nuxt.config.js before proceeding:
 */

const Code = ({ children }) =>(
  <Text variant="styles.inlineCode" sx={{ fontSize:'16px' }}>
    { children }
  </Text>
)

export const LacksStorybookConf = ({ env }) => (
  <FullPage>
    <div style={{ maxWidth: '850px', textAlign:'center', color:'#25252D' }}>
      <img src="/logo.png" width="40px" />
      <h2>Welcome to the new <br/>
        custom type builder 🎉🎉 </h2>
      <Text as="p" style={{ lineHeight: '30px', fontSize: '18px'}}>
        To make your project work with the new builder, you must update your config file.
        This is because Slice stories have moved from <Code>{'~/slices/...'}</Code> to <Code>{'~/.slicemachine/assets/slices/**/*.stories.js'}</Code>.
        <br/><br/>
        We have already moved your files for you,
        but you must update your Storybook options in <Code>{ env.framework == "nuxt" ? 'nuxt.config.js' : '.storybook/main.js' }</Code>
      </Text>
      <br /><br />
      {env.framework == "nuxt" ? <img src="/nuxt-storybook.png" /> : <img src="/next-storybook.png" />}
    </div>
  </FullPage>
)
