import { useContext, Fragment } from 'react'
import Head from 'next/head'

import Container from '../components/Container'
import ListLibraries from '../components/ListLibraries'
import { LibContext } from '../src/lib-context'

import Link from 'next/link'

import {
  Text,
  Select,
  Flex,
  Link as ThemeLink,
} from 'theme-ui'

const Index = () => {
  const libraries = useContext(LibContext)
  return (
    <Fragment>

      <Flex
        as="header"
        sx={{
          alignItems: 'center',
          variant: 'styles.header',
          bg: 'deep',
          p: 2
        }}
      >
        <Link href="/index" as="/" passHref>
          <ThemeLink
            to='/'
            sx={{
              variant: 'styles.navLink',
              p: 2,
              cursor: 'pointer',
              textDecoration: 'none'
            }}>
            <Text as="h4" sx={{ m: 0 }}>
              library
            </Text>
          </ThemeLink>
        </Link>
      </Flex>

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
