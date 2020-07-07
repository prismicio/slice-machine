import theme from '../src/theme'
import { ThemeProvider } from 'theme-ui'

import useSwr from 'swr'

import LibProvider, { LibContext } from '../src/lib-context'

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
      <LibProvider value={libraries}>
        <Component {...pageProps} />
      </LibProvider>
    </ThemeProvider>
  );
}

export default MyApp