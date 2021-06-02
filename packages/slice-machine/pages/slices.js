import Head from 'next/head'
import React, { Fragment, useState, useContext } from 'react'
import { FiLayers } from 'react-icons/fi'
import { Box, Flex, Button, Text, Spinner } from 'theme-ui'
import Container from 'components/Container'
import SliceList from 'components/SliceList'

import { LibrariesContext } from 'src/models/libraries/context'

import { GoPlus } from 'react-icons/go'

import CreateSlice from 'components/Forms/CreateSlice'

import { fetchApi } from 'lib/builders/common/fetch'

import Header from 'components/Header'

const UnclickableCardWrapper = ({ children }) => children

const CreateSliceButton = ({ onClick, loading }) => (
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

const SlicesIndex = () => {
  const libraries = useContext(LibrariesContext)
  const [data, setData] = useState({ loading: false })
  const [isOpen, setIsOpen] = useState(false)

  const _onCreate = ({ sliceName, from }) => {
    fetchApi({
      url: `/api/slices/create?sliceName=${sliceName}&from=${from}`,
      setData() {
        setData({ loading: true })
      },
      successMessage: 'Model was correctly saved to Prismic!',
      onSuccess({ reason, variationId }) {
        if (reason) {
          return console.error(reason)
        }
        window.location.href = `/${from}/${sliceName}/${variationId}`
      }
    })
  }

  const localLibs = libraries.filter(e => e.isLocal)

  return (
    <Fragment>
      <Head>
        <title>SliceMachine UI</title>
      </Head>
      <Container>
        <main>
          <Header
            ActionButton={localLibs.length ? <CreateSliceButton onClick={() => setIsOpen(true)} {...data} /> : null}
            MainBreadcrumb={(
              <Fragment><FiLayers /> <Text ml={2}>Slice libraries</Text></Fragment>
            )}
            breadrumbHref="/slices"
          />
          <Box>
            {libraries &&
              libraries.map(({ name, isLocal, components }, i) => isLocal || true ? (
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
                  <SliceList
                    cardType="ForSlicePage"
                    {...(!isLocal
                      ? {
                          CardWrapper: UnclickableCardWrapper,
                        }
                      : null)}
                    slices={components.map(([e]) => e)}
                  />
                </div>
              ) : null )
            }
          </Box>
        </main>
      </Container>
      {
        localLibs.length ? (
          <CreateSlice
            isOpen={isOpen}
            close={() => setIsOpen(false)}
            libraries={localLibs}
            onSubmit={({ sliceName, from }) => _onCreate({ sliceName, from })}
          />
        ) : null
      }
    </Fragment>
  )
}

export default SlicesIndex
