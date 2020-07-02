import Head from 'next/head'
import getConfig from "next/config";
import { listComponentsByLibrary } from '../lib/listComponents'

import { getInfoFromPath as getLibraryInfo } from 'sm-commons/methods/lib'

const Home = ({ config, libs }) => (
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
        { libs ? JSON.stringify(libs) : null}
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

  const libs = await listComponentsByLibrary(config.slices)

  return {
    libs
  }
};

export default Home
