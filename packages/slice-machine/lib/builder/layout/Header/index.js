import { useState } from 'react'
import {
  Box,
  Flex,
  Button
} from 'theme-ui'

import MetaData from './MetaData'

const Header = ({ info, Model }) => {
  const [showMeta, setShowMeta] = useState(false)
  return (
    <Flex
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          margin: '0 auto',
          maxWidth: 1224,
          mx: 'auto',
          px: 3,
          pt: 4,
        }}
      >

        <Box as="section" sx={{
          flexGrow: 99999,
          flexBasis: 0,
          minWidth: 320,
        }}>
          <Flex sx={{ justifyContent: 'space-between'}}>
            <Box as="h2" sx={{ pb:3}}>
              {info.sliceName}
            </Box>
            {/* <Box>
              <Button onClick={() => setShowMeta(true)} sx={{ height: 'fit-content', fontSize: 2 }}>MetaData</Button>
            </Box> */}
          </Flex>
          <hr />

        </Box>
        <MetaData isOpen={showMeta} Model={Model} close={() => setShowMeta(false)}/>
      </Flex>
  )
}

export default Header
