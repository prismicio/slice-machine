import { Fragment } from 'react'
import Link from 'next/link'
import { Box } from 'theme-ui'
import Card from './Card'

const editLinkProps = ({ href, sliceName }) => ({
  href: '/[lib]/[sliceName]',
  as: `/${href}/${sliceName}`
})

export default ({ libraries }) => (
  <Fragment>
    {
      libraries && libraries.map(([lib, slices]) => (
        <div key={lib}>
          <Box
            as="h2"
            sx={{
              pb:3,
            }}>
            {lib}
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
              slices.map(([slice]) => (
                <Link key={`${slice.from}-${slice.id}`} {...editLinkProps(slice)} passHref>
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