import theme from '../src/theme'
import { ThemeProvider, BaseStyles } from 'theme-ui'

import useSwr from 'swr'

import LibProvider from '../src/lib-context'

import 'rc-drawer/assets/index.css'
import 'lib/builder/layout/Drawer/index.css'
import 'src/css/modal.css'

const fetcher = (url) => fetch(url).then((res) => res.json())

function MyApp({
  Component,
  pageProps,
}) {
  const { data: libraries, error } = useSwr('/api/components', fetcher)

  if (error) return <div>Failed to load slices</div>
  if (!libraries) return <div></div>;

  return (
    <ThemeProvider theme={theme}>
      <BaseStyles>
        <LibProvider value={libraries}>
          <Component {...pageProps} />
        </LibProvider>
      </BaseStyles>
    </ThemeProvider>
  );
}

export default MyApp