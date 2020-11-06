import React from 'react'
import { useContext, Fragment } from 'react'
import Head from 'next/head'

import Container from 'components/Container'
import ListLibraries from 'components/ListLibraries'
import { LibContext } from 'src/lib-context'
import { useColorMode } from 'theme-ui'

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
          {
            libraries.length ? (
              <ListLibraries libraries={libraries} />
            ) : (
              <div>
                No library found. <a target="_blank" href="https://prismic.io">Create one!</a>
              </div>
            )
          }
        </main>
      </Container>
    </Fragment>
  )
}

export default Index
