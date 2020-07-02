import App from 'next/app'
import getConfig from 'next/config'

function MyApp({ Component, pageProps, config }) {
  return <Component {...pageProps} config={config} />
}

MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  const { publicRuntimeConfig } = getConfig()
  return {
    ...appProps,
    config: publicRuntimeConfig
  }
}

export default MyApp