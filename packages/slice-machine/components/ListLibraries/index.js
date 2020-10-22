import { Fragment } from 'react'
import Link from 'next/link'
import { Box } from 'theme-ui'

import { Flex, Col } from '../Flex'
import Card from './Card'

const editLinkProps = ({ href, sliceName }) => ({
  href: '/[lib]/[sliceName]',
  as: `/${href}/${sliceName}`
})

export default ({ libraries }) => (
  <Fragment>
    {
      libraries && libraries.map(([lib, components]) => (
        <div key={lib}>
          <Box
            as="h2"
            sx={{
              pb:3,
            }}>
            {lib}
          </Box>
          <hr />

          <Flex as="section" p={0} pt={4} mb={3}>
            {
              components.map((component) => (
                <Col cols={components.length > 2 ? 3 : 2} key={component.sliceName}>
                  <Link {...editLinkProps(component)} passHref>
                    <Card {...component} />
                  </Link>
                </Col>
              ))
            }
          </Flex>
        </div>
      ))
    }
  </Fragment>
)