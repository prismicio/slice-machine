import { Fragment } from 'react'
import { useRouter } from 'next/router'
import theme from '../src/theme'
import { ThemeProvider, BaseStyles } from 'theme-ui'

import useSwr from 'swr'

import LibProvider from '../src/lib-context'
import ConfigProvider from '../src/config-context'

import LoadingPage from 'components/LoadingPage'
import FullPage from 'components/FullPage'
import AuthInstructions from 'components/AuthInstructions'
import ConfigErrors from 'components/ConfigErrors'

import 'rc-drawer/assets/index.css'
import 'lib/builder/layout/Drawer/index.css'
import 'src/css/modal.css'

const AUTH_BLOCKING = false

const fetcher = (url) => fetch(url).then((res) => res.json())

const LibError = () => (
  <FullPage>
    <div>
      <h2>No library found</h2>
      <p style={{ lineHeight: '30px', fontSize: '18px'}}>
        Possible reasons: you did not define local libraries in your <pre style={preStyle}>sm.json</pre> file, eg. <pre style={preStyle}>{`{ "libraries": ["@/slices"] }`}</pre><br/>
        Once it's done, run <pre style={preStyle}>prismic sm --create-slice</pre>. You should now see your library on this page.
      </p>
    </div>
  </FullPage>
)

function DisplayLibs({
  libraries,
  children
}) {
  return !libraries.length || libraries.err ? <LibError /> : children
}

const preStyle = {
  display: 'inline',
  background: '#F1F1F1',
  padding: '2px'
}

function MyApp({
  Component,
  pageProps,
}) {
  const router = useRouter()
  const { data: authData } = useSwr('/api/auth', fetcher)
  const { data } = useSwr('/api/libraries', fetcher)

  if (!authData || !data) {
    return <LoadingPage />
  }
  
  if (data.err) return (
    <FullPage>
      <div>
        <h2>{data.err.reason}</h2>
        <p style={{ lineHeight: '30px', fontSize: '18px'}}>
          Possible reasons: your <pre style={preStyle}>sm.json</pre> file does not contain a valid <pre style={preStyle}>apiEndpoint</pre> value.<br/>
          Try login to Prismic via the CLI (<pre style={preStyle}>prismic login</pre>) and that <br/><pre style={preStyle}>~/.prismic</pre> contains a <pre style={preStyle}>prismic-auth</pre> cookie.
        </p>
      </div>
    </FullPage>
  )
  const { libraries = [], config, errors = {} } = data
  
  console.log('------ SliceMachine log ------')
  console.log('Loaded libraries: ', { libraries })
  console.log('Loaded config: ', { config, configErrors: errors })
  console.log('------ End of log ------')
  const migrations = libraries.reduce((acc, [_, slices]) => {
    const toMigrate = slices.filter(e => e.migrated)
    return [...acc, ...toMigrate]
  }, [])

  if (migrations.length && router.asPath !== "/migration") {
    router.replace("/migration")
  }



  return (
    <ThemeProvider theme={theme}>
      <BaseStyles>
        <ConfigProvider value={config}>
          <LibProvider value={libraries}>
            {
              !authData.token && AUTH_BLOCKING ? <AuthInstructions /> : (
                <Fragment>
                  {
                    Object.keys(errors).length ? (
                      <ConfigErrors errors ={errors} />
                    ) : <DisplayLibs libraries={libraries}><Component {...pageProps} migrations={migrations} /></DisplayLibs>
                  }
                </Fragment>
              )
            }
          </LibProvider>
        </ConfigProvider>
      </BaseStyles>
    </ThemeProvider>
  );
}

export default MyApp