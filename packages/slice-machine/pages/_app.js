import { Fragment, useEffect } from 'react'
import { useRouter } from 'next/router'
import theme from '../src/theme'
import { ThemeProvider, BaseStyles } from 'theme-ui'

import useSwr from 'swr'

import LibProvider from '../src/lib-context'
import ConfigProvider from '../src/config-context'

import LoadingPage from 'components/LoadingPage'
import ConfigErrors from 'components/ConfigErrors'

import 'rc-drawer/assets/index.css'
import 'lib/builder/layout/Drawer/index.css'
import 'src/css/modal.css'

const fetcher = (url) => fetch(url).then((res) => res.json())

const LibError = () => <div>No libraries. Create one!</div>

function MyApp({
  Component,
  pageProps,
}) {
  const router = useRouter()
  const { data, error } = useSwr('/api/libraries', fetcher)
  
  if (error) return <div>Failed to load slices</div>
  if (!data) {
    return <LoadingPage />
  }
  const { libraries = [], config, errors = {} } = data
  
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
              Object.keys(errors).length ? (
                <ConfigErrors errors ={errors} />
              ) : (
                <Fragment>
                  {
                    !libraries.length || libraries.err ? (
                      <LibError />
                    ) : (
                      <Component {...pageProps} migrations={migrations} />
                    )
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