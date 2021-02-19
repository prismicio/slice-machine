import { Fragment, useState, useMemo } from 'react'
import { Button, Spinner, Badge, Flex, Box, useThemeUI, useColorMode } from 'theme-ui'

import IconButton from '../IconButton'

import { VscColorMode } from 'react-icons/vsc'
import { AiOutlineWarning } from 'react-icons/ai'

const WarningsIcon = ({ theme, warnings, onClick }) => (
  <Fragment>
    <IconButton
        Icon={AiOutlineWarning}
        label="Open warnings panel"
        sx={{ cursor: "pointer", color: theme.colors.icons }}
        onClick={onClick}
      />
    <Badge variant="circle" ml={-3} mt={-3}>{warnings}</Badge>
  </Fragment>
)

const Chromatic = ({ env }) => env.chromatic ? [
  <Button key="chromatic-link-1" as="a" href={env.chromatic.storybook} target="_blank" ml={2} mr={1}>Online Storybook</Button>,
  <Button key="chromatic-link-2" as="a" href={env.chromatic.library} target="_blank" mr={1}>Chromatic preview</Button>
] : null

const NavBar = ({ as = 'header', sx = {}, children, env, warnings, openPanel }) => {
  const { theme } = useThemeUI()
  const [pushing, setPushing] = useState(false)
  const [colorMode, setColorMode] = useColorMode()

  const memoedWarnings = useMemo(() => warnings, [warnings])

  const pushAll = () => {
    if (!pushing) {
      setPushing(true)
      fetch('/api/push-all')
        .then(async(res) => {
          const json = await res.json()
          let flag = false
          Object.entries(json).forEach(([key, val]) => {
            if (val?.message) {
              flag = true
              console.error(`Push failed for slice "${key}". Reason: ${val.message}`)
            }
          })
          if (Object.entries(json).length > 1 && flag) {
            console.log('👆 Other slices have been pushed to Prismic.')
          }
          setPushing(false)
        }).catch(console.log)
    }
  }

  return (
    <Flex
      as={as}
      sx={{
        alignItems: 'center',
        variant: 'styles.header',
        bg: 'deep',
        py: 2,
        px: 3,
        ...sx
      }}
    >
      { children }
      <Box sx={{ mx: 'auto' }} />
      <Button onClick={pushAll} sx={{ display: 'flex', alignItems: 'center' }}>
        {pushing ? <Spinner color="#F7F7F7" size={16} mr={2} /> : null}Push all
      </Button>
      <Chromatic env={env} />
      {
        memoedWarnings && memoedWarnings.length ? (
          <WarningsIcon theme={theme} warnings={memoedWarnings.length} onClick={openPanel} />
        ) : null
      }
      <IconButton
        Icon={VscColorMode}
        label="Color Mode"
        sx={{ cursor: "pointer", color: theme.colors.icons, ml: 1 }}
        onClick={e => { setColorMode(colorMode === 'default' ? 'dark' : 'default')}}
      />
    </Flex>
  )
}

export default NavBar