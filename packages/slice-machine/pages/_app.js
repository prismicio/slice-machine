import { useEffect, useState } from 'react'
import Drawer from 'rc-drawer'
import { ThemeProvider, BaseStyles } from 'theme-ui'

import useSwr from 'swr'

import theme from 'src/theme'
import LibProvider from 'src/lib-context'
import ConfigProvider from 'src/config-context'
import { ModelHandler } from 'src/model-context'

import LoadingPage from 'components/LoadingPage'
import ConfigErrors from 'components/ConfigErrors'
import NavBar from 'components/NavBar/WithRouter'
import Warnings from 'components/Warnings'

import { FetchError, NoLibraryConfigured } from 'components/UnrecoverableErrors'

import 'react-tabs/style/react-tabs.css'
import 'rc-drawer/assets/index.css'
import 'lib/builder/layout/Drawer/index.css'
import 'src/css/modal.css'

const fetcher = (url) => fetch(url).then((res) => res.json())

const RenderStates = {
  Loading: () => <LoadingPage />,
  Default: ({ Component, ...rest }) => <Component {...rest} />,
  FetchError,
  LibError: FetchError,
  NoLibraryConfigured,
  ConfigError: ({ configErrors }) => <ConfigErrors errors={configErrors} />
}

function MyApp({ Component, pageProps }) {
  const { data } = useSwr('/api/state', fetcher)
  const [drawerState, setDrawerState] = useState({ open: false })
  const [state, setRenderer] = useState({ Renderer: RenderStates.Loading, payload: null })

  const openPanel = (priority) => setDrawerState({ ...drawerState, open: true, ...priority ? { priority } : null })

  useEffect(() => {
    if (!data) {
      return
    }
    // else if (data.clientError) {
    //   setRenderer({ Renderer: RenderStates.FetchError, payload: data })
    // }
    else if (!data.libraries) {
      setRenderer({ Renderer: RenderStates.LibError, payload: data })
    }
    else if (!data.libraries.length) {
      setRenderer({ Renderer: RenderStates.NoLibraryConfigured, payload: { env: data.env } })
    }
    else if (data) {
      setRenderer({ Renderer: RenderStates.Default, payload: { ...data } })
      const { libraries, env, configErrors, warnings } = data
      console.log('------ SliceMachine log ------')
      console.log('Loaded libraries: ', { libraries })
      console.log('Loaded env: ', { env, configErrors })
      console.log('Warnings: ', { warnings })
      console.log('------ End of log ------')
    }
  }, [data])

  const { Renderer, payload } = state

  return (
    <ThemeProvider theme={theme}>
      <BaseStyles>
        {
          !data ? <Renderer {...payload }/> : (
            <ConfigProvider value={data}>
              {
                !data.libraries
                  ? <Renderer Component={Component} pageProps={pageProps} {...payload} openPanel={openPanel} />
                  : (
                    <LibProvider value={data.libraries}>
                      <ModelHandler libraries={data.libraries}>
                        <NavBar
                          env={data.env}
                          warnings={data.warnings}
                          openPanel={() => openPanel()}
                        />
                        <Renderer Component={Component} pageProps={pageProps} {...payload} openPanel={openPanel} />
                        <Drawer
                          placement="right"
                          open={drawerState.open}
                          onClose={() => setDrawerState({ ...drawerState, open: false })}
                        >
                          <Warnings
                            priority={drawerState.priority}
                            list={data.warnings}
                            configErrors={data.configErrors}
                          />
                        </Drawer>
                      </ModelHandler>
                    </LibProvider>
                  )
              }
            </ConfigProvider>
          )
        }
      </BaseStyles>
    </ThemeProvider>
  );
}

export default MyApp