import React from 'react'
import { useContext, Fragment } from 'react'
import Head from 'next/head'

import Container from 'components/Container'
import ListLibraries from 'components/ListLibraries'
import { LibContext } from 'src/lib-context'

const Index = () => {
  const libraries = useContext(LibContext)

  return (
    <Fragment>
      <Container>
        <Head>
          <title>SliceMachine UI</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main>
          <ListLibraries libraries={libraries || []} />
        </main>
      </Container>
    </Fragment>
  )
}

export default Index
