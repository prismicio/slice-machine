import React, { useEffect } from 'react'
import { mutate } from 'swr'
import { useContext, Fragment } from 'react'
import Head from 'next/head'

import Container from 'components/Container'
import LibrariesList from 'components/LibrariesList'
import { LibrariesContext } from 'src/models/libraries/context'

const Index = () => {
  const libraries = useContext(LibrariesContext)

  return (
    <Fragment>
      <Container>
        <Head>
          <title>SliceMachine UI</title>
        </Head>
        <main>
          <LibrariesList libraries={libraries || []} />
        </main>
      </Container>
    </Fragment>
  )
}

export default Index
