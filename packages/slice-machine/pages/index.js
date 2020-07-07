import { useContext } from 'react'
import Head from 'next/head'
import getConfig from "next/config";

import {
  Link,
} from 'theme-ui'

import Container from '../components/Container'
import ListLibraries from '../components/ListLibraries'
import { LibContext } from '../src/lib-context';

const { publicRuntimeConfig: config } = getConfig();


const Index = () => {
  const libraries = useContext(LibContext)
  return (
    <Container>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          Welcome to SliceMachine
        </h1>

        <p className="description">
          API explorer: <Link href={config.apiEndpoint}>{config.apiEndpoint}</Link>
        </p>
        <ListLibraries libraries={libraries} />
      </main>
    </Container>
  )
}

export default Index
