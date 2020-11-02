import { Fragment, useEffect, useState } from 'react'
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

const FetchError = ({ err }) => (
  <FullPage>
    <div>
      <h2>{err.reason}</h2>
      <p style={{ lineHeight: '30px', fontSize: '18px'}}>
        Possible reasons: your <pre style={preStyle}>sm.json</pre> file does not contain a valid <pre style={preStyle}>apiEndpoint</pre> value.<br/>
        Try login to Prismic via the CLI (<pre style={preStyle}>prismic login</pre>) and that <br/><pre style={preStyle}>~/.prismic</pre> contains a <pre style={preStyle}>prismic-auth</pre> cookie.
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

function parseMigrations(data) {
  if (!data || !data.libraries) {
    return null
  }
  return data.libraries.reduce((acc, [_, slices]) => {
    const toMigrate = slices.filter(e => e.migrated)
    return [...acc, ...toMigrate]
  }, [])
}

const preStyle = {
  display: 'inline',
  background: '#F1F1F1',
  padding: '2px'
}

const states = {
  LOADING: 'LOADING',
  ERR: 'ERR'
}
const RenderStates = {
  Loading: () => <LoadingPage />,
  FetchError: ({ err }) => <FetchError err={err} />,
  ConfigError: ({ configErrors }) => <ConfigErrors errors={configErrors} />,
  Migrate: ({ migrations }) => <div>Migrate me!</div>
}

function MyApp({
  Component,
  pageProps,
}) {
  const router = useRouter()
  const [status, setStatus] = useState(states.LOADING)
  const [state, setState] = useState({ Renderer: RenderStates.Loading, payload: null })
  // const { data: authData } = useSwr('/api/auth', fetcher)
  // const { data } = useSwr('/api/libraries', fetcher)
  // const [displayAuth, setDisplayAuth] = useState(false)

  const { data, error } = useSwr('/api/state', fetcher)

  const migrations = parseMigrations(data)

  useEffect(() => {
    if (!data) {
      return
    }
    if (data.err) {
      setRenderer({ Renderer: RenderStates.FetchError, payload: data })
    }
    // if (Object.keys(configErrors)) {
    //   setStatus(states.CONFIG_ERRORS)
    // }
    // if (migrations && migrations.length) {
    //   setStatus(states.MIGRATE)
    // }

  }, [data, migrations])

  // console.log({ error })

  // const { libraries = [], env, configErrors = {} } = data
  // //  useEffect(() => {

  // // }, [env])

  
  console.log({ data })
  // console.log('------ SliceMachine log ------')
  // console.log('Loaded libraries: ', { libraries })
  // console.log('Loaded env: ', { env, configErrors })
  // console.log('------ End of log ------')

  const { Renderer, payload } = state
  return <Renderer {...payload }/>

  // return (
  //   <ThemeProvider theme={theme}>
  //     <BaseStyles>
  //       <ConfigProvider value={env}>
  //         <LibProvider value={libraries}>
  //           {
  //             Object.keys(configErrors).length ? (
  //               <ConfigErrors errors={configErrors} />
  //             ) : <DisplayLibs libraries={libraries}><Component {...pageProps} migrations={migrations} /></DisplayLibs>
  //           }
  //         </LibProvider>
  //       </ConfigProvider>
  //     </BaseStyles>
  //   </ThemeProvider>
  // );
}

export default MyApp