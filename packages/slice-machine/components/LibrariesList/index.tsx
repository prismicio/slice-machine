import { Fragment } from 'react'
import NextLink from 'next/link'
import { Box, Link } from 'theme-ui'
import Card from './Card'
import LibraryState from 'lib/models/ui/LibraryState'
import SliceState from 'lib/models/ui/SliceState'
import * as Links from 'lib/builder/links'

const defaultRenderTitle = (lib: LibraryState ) => {
  return (
    <Fragment>
      <Box
        as="h2"
        sx={{ pb:3 }}
      >
        {lib.name}
      </Box>
      <hr />
    </Fragment>
  )
}

const DefaultCardWrapper = ({
  link,
  children
}) => {
  return (
    <Link
      sx={{
        textDecoration: 'none',
        color: 'inherit'
      }}
      as="a"
      href={link.as}
    >
      { children }
    </Link>
  )
}

export default ({
  libraries,
  cardProps = {},
  CardWrapper = DefaultCardWrapper,
  renderTitle = defaultRenderTitle
}: {
  libraries: ReadonlyArray<LibraryState>,
  cardProps?: object | undefined,
  renderTitle?: Function,
  CardWrapper?: Function
}) => (
  <Fragment>
    {
      libraries && libraries.map(lib => (
        <div key={lib.name}>
          { renderTitle(lib) }
          <Box
            as="section"
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gridGap: '16px',
              p: 0,
              pt: 4,
              mb: 3
            }}
          >
            {
              lib.components.map(([slice]) => {
                const defaultVariation = SliceState.variation(slice)
                const variationId = defaultVariation.id
                const link = Links.variation(slice.href, slice.jsonModel.name, variationId)
                return (
                  <CardWrapper {...cardProps} slice={slice} variationId={variationId} link={link} key={`${slice.from}-${slice.jsonModel.id}-${variationId}`}>
                    <Card {...slice} defaultVariation={defaultVariation} />
                  </CardWrapper>
                )
              })
            }
          </Box>
        </div>
      ))
    }
  </Fragment>
)