import React from 'react'
import { useContext, Fragment } from 'react'
import Head from 'next/head'

import Container from 'components/Container'
import LibrariesList from 'components/LibrariesList'
import { StoreContext } from 'src/store/context'

const Index = () => {
  const libraries = useContext(StoreContext)

  return (
    <Fragment>
      <Container>
        <Head>
          <title>SliceMachine UI</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main>
          <LibrariesList libraries={libraries || []} />
        </main>
      </Container>
    </Fragment>
  )
}

export default Index
