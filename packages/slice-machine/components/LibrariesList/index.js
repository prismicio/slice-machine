import { Fragment } from 'react'
import Link from 'next/link'
import { Box } from 'theme-ui'
import Card from './Card'
import LibraryState from 'lib/models/ui/LibraryState'

const editLinkProps = (href, sliceName) => ({
  href: '/[lib]/[sliceName]',
  as: `/${href}/${sliceName}`
})

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
              lib.components.map(([slice]) => (
                <Link key={`${slice.from}-${slice.jsonModel.id}`} {...editLinkProps(slice.href, slice.jsonModel.name)} passHref>
                  <Card {...slice} />
                </Link>
              ))
            }
          </Box>
        </div>
      ))
    }
  </Fragment>
)