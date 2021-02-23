import App from 'next/app'
import { memo, useRef, useEffect, useState } from 'react'
import { ThemeProvider, BaseStyles } from 'theme-ui'

import useSwr from 'swr'
import Drawer from 'rc-drawer'

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
import 'react-datepicker/dist/react-datepicker.css'
import 'src/css/modal.css'

function simpleCheck(a, b) {
  return a !== b;
}
function shallowCheck(a, b, verbose) {
  if (typeof a !== typeof b) {
    verbose && console.log('Not the same type');
    return false;
  }
  if (typeof a !== 'object') {
    return simpleCheck(a, b);
  }
  const A = a;
  const B = b;
  const keys = Object.keys(A);
  if (!deepCheck(A, B, verbose)) {
    verbose && console.log('Objects keys changed');
    return false;
  }
  for (const k in keys) {
    if (simpleCheck(A[k], B[k])) {
      verbose && console.log(`Object differ at key : ${k}`);
      return false;
    }
  }
  return true;
}
function deepCheck(a, b, verbose) {
  try {
    return JSON.stringify(a) !== JSON.stringify(b);
  } catch (e) {
    verbose && console.log(e);
    return false;
  }
}
function compFNSelection(compType) {
  switch (compType) {
    case 'SIMPLE':
      return (a, b, _verbose) => simpleCheck(a, b);
    case 'SHALLOW':
      return (a, b, verbose) =>
        shallowCheck(a, b, verbose);
    case 'DEEP':
      return (a, b, verbose) =>
        deepCheck(a, b, verbose);
    default:
      console.log('Comparaison type unvailable. Test will always return false');
      return () => false;
  }
}
function ReactFnCompPropsChecker(
  props,
) {
  const { children, childrenProps, compType = 'SIMPLE', verbose } = props;
  const oldPropsRef = useRef();
  useEffect(() => {
    const oldProps = oldPropsRef.current;
    if (oldProps === undefined) {
      console.log('First render : ');
      Object.keys(childrenProps).forEach(k =>
        console.log(`${k} : ${childrenProps[k]}`),
      );
    } else {
      const changedProps = Object.keys(childrenProps)
        .filter(k =>
          compFNSelection(compType)(oldProps[k], childrenProps[k], verbose),
        )
        .map(k => `${k} : [OLD] ${oldProps[k]}, [NEW] ${childrenProps[k]}`);
      if (changedProps.length > 0) {
        console.log('Changed props : ');
        changedProps.forEach(console.log);
      } else {
        console.log('No props changed');
      }
    }
    oldPropsRef.current = childrenProps;
  }, [childrenProps, compType, verbose]);
  return children(childrenProps);
}

const fetcher = (url) => fetch(url).then((res) => res.json())

const RenderStates = {
  Loading: () => <LoadingPage />,
  Default: ({ Component, pageProps, ...rest }) => <Component {...pageProps} {...rest} />,
  FetchError,
  LibError: FetchError,
  NoLibraryConfigured,
  ConfigError: ({ configErrors }) => <ConfigErrors errors={configErrors} />
}

function MyApp({ Component, pageProps }) {
  const { data } = useSwr('/api/state', fetcher)
  const [drawerState, setDrawerState] = useState({ open: false })
  const [state, setRenderer] = useState({ Renderer: RenderStates.Loading, payload: null })

  const openPanel = memo((priority) => setDrawerState({ ...drawerState, open: true, ...priority ? { priority } : null }))

  useEffect(() => {
    if (!data) {
      return
    }
    else if (!data.libraries) {
      setRenderer({ Renderer: RenderStates.LibError, payload: data })
    }
    else if (!data.libraries.length) {
      setRenderer({ Renderer: RenderStates.NoLibraryConfigured, payload: { env: data.env } })
    }
    else if (data) {
      setRenderer({ Renderer: RenderStates.Default, payload: data })
      const { env, configErrors, warnings } = data
      console.log('------ SliceMachine log ------')
      console.log('Loaded libraries: ', { libraries: data.libraries })
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
                !payload || !payload.libraries
                  ? <Renderer Component={Component} pageProps={pageProps} {...payload} openPanel={openPanel} />
                  : (
                      <LibProvider value={data.libraries}>
                        <ModelHandler env={data.env} {...payload}>
                          <NavBar
                            env={data.env}
                            warnings={data.warnings}
                            openPanel={() => openPanel()}
                          />
                          <ReactFnCompPropsChecker
                            childrenProps={{
                              Component,
                              pageProps,
                              ...payload,
                              openPanel
                            }}
                          >
                            {props=>(<Renderer{...props}/>)}
                          </ReactFnCompPropsChecker>
                          {/* <Renderer Component={Component} pageProps={pageProps} {...payload} openPanel={openPanel} /> */}
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
  )
}

MyApp.getInitialProps = async (appContext) => {
  return await App.getInitialProps(appContext)
}

export default MyApp