import FullPage from 'components/FullPage'

export const FetchError = ({ clientError }) => (
  <FullPage>
    <div>
      <h2>{clientError.reason}</h2>
      <p style={{ lineHeight: '30px', fontSize: '18px'}}>
        Possible reasons: your <pre>sm.json</pre> file does not contain a valid <pre>apiEndpoint</pre> value.<br/>
        Try to login to Prismic via the CLI (<pre>prismic login</pre>) and that <br/><pre>~/.prismic</pre> contains a <pre>prismic-auth</pre> cookie.
      </p>
    </div>
  </FullPage>
)

export const NoLibraryConfigured = () => (
  <FullPage>
    <div>
      <h2>No library found</h2>
      <p style={{ lineHeight: '30px', fontSize: '18px'}}>
        Possible reasons: you did not define local libraries in your <pre>sm.json</pre> file, eg. <pre>{`{ "libraries": ["@/slices"] }`}</pre><br/>
        Once it's done, run <pre>prismic sm --create-slice</pre>. You should now see your library on this page.
      </p>
    </div>
  </FullPage>
)