
import React, { useState } from 'react'
import Head from 'next/head'

import { useContext, Fragment } from 'react'
import { FiLayers } from 'react-icons/fi'
import { Flex, Button, Text } from 'theme-ui'
import Container from 'components/Container'
import SliceList from 'components/SliceList'

import { LibrariesContext } from 'src/models/libraries/context'

import { GoPlus } from 'react-icons/go'

import CreateSlice from 'components/Forms/CreateSlice'

import { fetchApi } from 'lib/builders/common/fetch'

const UnclickableCardWrapper = ({ children }) => children

const CreateSliceButton = ({ onClick }) => (
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
    <GoPlus size={"2em"} />
  </Button>
)

const SlicesIndex = () => {
  const libraries = useContext(LibrariesContext)
  // const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  //const { customTypes, onCreate } = useContext(CustomTypesContext)

  const _onCreate = ({ sliceName, from }) => {
    fetchApi({
      url: `/api/slices/create?sliceName=${sliceName}&from=${from}`,
      setData: () => null,
      successMessage: 'Model was correctly saved to Prismic!',
      onSuccess(res) {
        // get default variation here
        console.log({ success: true, res })
        window.location.href = `/${from}/${sliceName}/default-slice`
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
          {libraries &&
            libraries.map(({ name, isLocal, components }, i) => isLocal || true ? (
              <div key={name}>
                <Flex sx={{ alignItems: 'center', justifyContent: 'space-between'}}>
                  <Flex
                    sx={{
                      alignItems: "center",
                      fontSize: 4,
                      lineHeight: "48px",
                      fontWeight: "heading",
                      mb: 4,
                      mt: i ? 4 : 0
                    }}
                  >
                    <FiLayers /> <Text ml={2}>{name}</Text>
                  </Flex>
                  { localLibs.length ? <CreateSliceButton onClick={() => setIsOpen(true)}/> : null}
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
            ) : null )}
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
