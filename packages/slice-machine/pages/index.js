import Head from 'next/head'
import getConfig from "next/config";

import { getInfoFromPath as getLibraryInfo } from 'sm-commons/methods/lib'

const Home = ({ config, components }) => (
  <div className="container">
    <Head>
      <title>Create Next App</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main>
      <h1 className="title">
        Welcome to <a href="https://nextjs.org">Next.js!</a>
      </h1>

      <p className="description">
        Get started by editing <code>pages/index.js</code>
      </p>
      <code>
        { components ? JSON.stringify(components) : null}
      </code>
    </main>
  </div>
)

async function handleLib(libPath) {
  const {
    isLocal,
    pathExists,
    pathToSlices,
  } = await getLibraryInfo(libPath)
  return {
    isLocal,
    pathExists,
    pathToSlices,
  }
}

Home.getInitialProps = async (appContext) => {
  const { publicRuntimeConfig: config } = getConfig();

  const libs = await Promise.all(config.slices.map(async (lib) => handleLib(lib)))

  return {
    components: libs.filter(e => e.isLocal)
  }
};

export default Home
