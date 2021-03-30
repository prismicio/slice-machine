import { Fragment } from 'react'
import NextLink from 'next/link'
import { Box, Link } from 'theme-ui'
import Card from './Card'
import LibraryState from 'lib/models/ui/LibraryState'
import SliceState from 'lib/models/ui/SliceState'
import * as Links from 'lib/builder/links'

export default ({ libraries }) => (
  <Fragment>
    {
      libraries && libraries.map(lib => (
        <div key={lib.name}>
          <Box
            as="h2"
            sx={{
              pb:3,
            }}>
            {lib.name}
          </Box>
          <hr />

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
                  <Link
                    sx={{
                      textDecoration: 'none',
                      color: 'inherit'
                    }}
                    as="a"
                    key={`${slice.from}-${slice.jsonModel.name}-${variationId}`} href={link.as}
                  >
                    <Card {...slice} defaultVariation={defaultVariation} />
                  </Link>
                )
              })
            }
          </Box>
        </div>
      ))
    }
  </Fragment>
)