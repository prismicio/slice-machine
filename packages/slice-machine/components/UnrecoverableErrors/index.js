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

export const LacksStorybookConf = () => (
  <FullPage>
    <div style={{ maxWidth: '640px' }}>
      <h2>Missing path in Storybook configuration</h2>
      <Text style={{ lineHeight: '30px', fontSize: '18px'}}>
        We could not find a path to slice generated stories in your Storybook configuration.
        Please add <Text variant="styles.inlineCode">.slicemachine/assets/*/**/*.stories.js</Text> to Storybook <Text variant="styles.inlineCode">main.js</Text> file.
      </Text>
      <br /><br />
      <b>Example:</b><br/><br/>
      <img src="/storybook-main.png" />
    </div>
  </FullPage>
)