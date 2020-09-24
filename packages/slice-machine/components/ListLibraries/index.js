import { Fragment } from 'react'
import Link from 'next/link'

import { Flex, Col } from '../Flex'
import Card from './Card'

const editLinkProps = ({ from, sliceName }) => ({
  href: '/[lib]/[sliceName]',
  as: `/${from}/${sliceName}`
})

export default ({ libraries }) => (
  <Fragment>
    {
      libraries && libraries.map(([lib, components]) => (
        <div key={lib}>
          <h2>{lib}</h2>
          <Flex as="ul" p={0} mb={3}>
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
