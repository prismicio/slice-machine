import Head from 'next/head'
import React, { Fragment, useState, useContext } from 'react'
import { FiLayers } from 'react-icons/fi'
import { Box, Flex, Button, Text, Spinner } from 'theme-ui'

import { getFormattedLibIdentifier } from '../lib/utils/lib'
import Container from '../components/Container'

import { LibrariesContext } from '../src/models/libraries/context'
import Environment from '../lib/models/common/Environment'

import { GoPlus } from 'react-icons/go'

import CreateSlice from '../components/Forms/CreateSlice'

import { fetchApi } from '../lib/builders/common/fetch'

import Header from '../components/Header'
import Grid from '../components/Grid'

import LibraryState from '../lib/models/ui/LibraryState'
import SliceState from '../lib/models/ui/SliceState'
import { SharedSlice } from '../lib/models/ui/Slice'

const CreateSliceButton = ({ onClick, loading }: { onClick: Function, loading: boolean }) => (
  <Button
    onClick={() => onClick()}
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "50%",
      height: "48px",
      width: "48px",
    }}
  >
    {
      loading
        ? <Spinner color="#FFF" /> 
        : <GoPlus size="2em" />
    }
  </Button>
)

const SlicesIndex = ({ env }: { env: Environment }) => {
  const libraries = useContext(LibrariesContext)
  const [data, setData] = useState({ loading: false })
  const [isOpen, setIsOpen] = useState(false)

  const _onCreate = ({ sliceName, from }: { sliceName: string, from: string }) => {
    fetchApi({
      url: `/api/slices/create?sliceName=${sliceName}&from=${from}`,
      setData() {
        setData({ loading: true })
      },
      successMessage: 'Model was correctly saved to Prismic!',
      onSuccess({ reason, variationId }: { reason: string | undefined, variationId: string }) {
        if (reason) {
          return console.error(reason)
        }
        window.location.href = `/${from.replace(/\//g, "--")}/${sliceName}/${variationId}`
      }
    })
  }

  const localLibs = libraries.length ? libraries.filter(e => e && e.isLocal) : []
  const hasLocalLibs = localLibs.length
  const configLocalLibs = (env.userConfig.libraries || []).reduce<ReadonlyArray<{name: string}>>((acc, curr) => {
    const { isLocal, from } = getFormattedLibIdentifier(curr)
    if (!isLocal) {
      return acc
    }
    return [...acc, { name: from }]
  }, [])
  const hasConfigLocalLibs = configLocalLibs.length
  

  return (
    <Fragment>
      <Head>
        <title>SliceMachine UI</title>
      </Head>
      <Container>
        <main>
          <Header
            ActionButton={hasLocalLibs ? <CreateSliceButton onClick={() => setIsOpen(true)} {...data} /> : undefined}
            MainBreadcrumb={(
              <Fragment><FiLayers /> <Text ml={2}>Slice libraries</Text></Fragment>
            )}
            breadrumbHref="/slices"
          />
          {
            !libraries.length ? (
              <Box>
                {
                  hasConfigLocalLibs ? (
                    <Box>
                      <p>
                        We could not find any slice in your project.
                        <br />To start using the builder, create your first slice! 
                      </p>
                      <Button
                        onClick={() => setIsOpen(true)}
                      >
                        { data.loading ? <Spinner sx={{ position: "relative", top: '4px'}} color="#F7F7F7" size={18} mr={2} /> : null} Create slice
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <p>
                        We could not find any local library in your project.
                        <br />Please update your `sm.json` file with a path to slices, eg:
                      </p>
                      <p>
                        <pre>{`{ "libraries": ["@/slices"] }`}</pre>
                      </p>
                    </Box>
                  )
                }
              </Box>
            ) : null
          }
          <Box>
            {libraries &&
              libraries.map((maybelib: LibraryState | undefined, i) => {
                if (!maybelib) {
                  return null
                }
                const { name, isLocal, components } = maybelib
                return (
                <div key={name}>
                  <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', mt: i ? 4 : 0}}>
                    <Flex
                      sx={{
                        alignItems: "center",
                        fontSize: 3,
                        lineHeight: "48px",
                        fontWeight: "heading",
                        mb: 1,
                      }}
                    >
                      <Text>{name}</Text>
                    </Flex>
                    { !isLocal ? <p>⚠️ External libraries are read-only</p> : null}
                  </Flex>
                  <Grid
                    elems={components.map(([e]) => e)}
                    renderElem={(slice: SliceState) => {
                      return SharedSlice.render({
                        displayStatus: true,
                        slice
                      })
                    }}
                  />
                </div>
              )
            })
          }
          </Box>
        </main>
      </Container>
      {
        configLocalLibs.length ? (
          <CreateSlice
            isOpen={isOpen}
            close={() => setIsOpen(false)}
            libraries={configLocalLibs}
            onSubmit={({ sliceName, from }: { sliceName: string, from: string }) => _onCreate({ sliceName, from })}
          />
        ) : null
      }
    </Fragment>
  )
}

export default SlicesIndex
