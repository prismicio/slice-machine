import { useContext } from 'react'
import Head from 'next/head'
import getConfig from "next/config";

import Container from '../components/Container'
import ListLibraries from '../components/ListLibraries'
import { LibContext } from '../src/lib-context';

const { publicRuntimeConfig: config } = getConfig();


const Index = () => {
  const libraries = useContext(LibContext)
  return (
    <Container>
      <Head>
        <title>SliceMachine UI</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <ListLibraries libraries={libraries} />
      </main>
    </Container>
  )
}

export default Index
