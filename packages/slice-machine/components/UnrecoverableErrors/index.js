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

export const LacksStorybookConf = ({ env }) => (
  <FullPage>
    <div style={{ maxWidth: '850px', textAlign:'center', color:'#25252D' }}>
      <img src="/logo.png" width="40px" />
      <h2>Welcome to the new <br/>
        custom type builder 🎉🎉 </h2>
      <Text style={{ lineHeight: '30px', fontSize: '18px'}}>
        We migrated generated stories to another place, please update your conf.
        <br/>Please add
          <Text variant="styles.inlineCode" style={{fontSize:'16px'}}>
            {env.framework == "nuxt"
              ? "~/.slicemachine/assets/slices/**/*.stories.@(ts|js)"
              : "../.slicemachine/assets/*/**/*.stories.js"
            }
          </Text>
          {env.framework == "nuxt" ? " in your" : " in your Storybook" }
          <Text variant="styles.inlineCode" style={{fontSize:'16px'}}> {env.framework =="nuxt" ? "nuxt.config.js" : "main.js"}</Text> file.
      </Text>
      <br /><br />
      {env.framework == "nuxt" ? <img src="/nuxt-storybook.png" /> : <img src="/next-storybook.png" />}
    </div>
  </FullPage>
)
