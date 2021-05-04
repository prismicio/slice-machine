import Link from 'next/link'
import { useContext, useState } from 'react'
import { Box, Flex, Button, IconButton, Card as ThemeCard, Link as ThemeLink, Heading } from 'theme-ui'
import { CustomTypesContext } from "../src/models/customTypes/context"

import { GoPlus } from 'react-icons/go'



import Container from 'components/Container'

import Grid from 'components/Grid'
import ModalFormCard from 'components/ModalFormCard'

import CreateCustomType from 'components/Forms/CreateCustomType'

const Card = ({ ct }) => (
  <Link href={`/cts/${ct.id}`} passHref>
    <ThemeLink variant="links.invisible">
      <ThemeCard p={2} sx={{ minHeight: '60px'}}>
        <Heading as="h5">{ct.label}</Heading>
        { ct.repeatable ? 'repeatable' : ''}
      </ThemeCard>
    </ThemeLink>
  </Link>
)

const CustomTypes = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { customTypes, onCreate } = useContext(CustomTypesContext)

  const _onCreate = ({ id, label, repeatable }) => {
    onCreate(id, {
      label,
      repeatable,
    })
    setIsOpen(false)
  }

  return (
      <Container>
        <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box
            as="h2"
            sx={{ pb: 3 }}
          >
            Custom Types
          </Box>
          <Button
            onClick={() => setIsOpen(true)}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '50%',
              height: '48px',
              width: '48px'
            }}
          >
            <GoPlus size={"2em"} />
          </Button>
        </Flex>
        {/* <Button type="button" onClick={_onCreate}>New Custom Type</Button> */}
        <Grid
          elems={customTypes}
          renderElem={(ct) => (
            <Link passHref href={`/cts/${ct.id}`} key={ct.id}>
              <Card ct={ct} />
            </Link>
          )}
        />
        <CreateCustomType
          isOpen={isOpen}
          onSubmit={_onCreate}
          close={() => setIsOpen(false)}
        />
      </Container>
  )
}

export default CustomTypes