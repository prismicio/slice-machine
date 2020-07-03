import { Fragment } from "react";
import NextLink from 'next/link'
import getConfig from "next/config";

import {
  Link,
  Flex,
  Box,
  Button
} from 'theme-ui'

const previewUrl = (component) => `${config.storybook}/?path=/story/${component.sliceName.toLowerCase()}`
const editLinkProps = ({ from, sliceName }) => ({
  href: '/[lib]/[sliceName]',
  as: `/${from}/${sliceName}`
})

const { publicRuntimeConfig: config } = getConfig();


export default ({ libraries }) => (
  <Fragment>
    {
      libraries && libraries.map(([lib, components]) => (
        <div key={lib}>
          <h3>{lib}</h3>
          <Box as="ul" p={0} mb={2}>
            {
              components.map((component, i) => (
                <Flex
                  p={2}
                  as="li"
                  key={`${lib}-${component.sliceName}`}
                  sx={{
                    border: t => `1px solid ${t.colors.text}`,
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  {component.sliceName}
                  <div>
                    <Button target="_blank" href={previewUrl(component)} as={Link}>Preview</Button>
                    <NextLink passHref {...editLinkProps(component)}>
                      <Button ml={2} as={Link}>edit</Button>
                    </NextLink>
                  </div>
                </Flex>
              ))
            }
          </Box>
        </div>
      ))
    }
  </Fragment>
)