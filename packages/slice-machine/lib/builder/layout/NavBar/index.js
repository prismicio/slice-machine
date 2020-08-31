import {
  Button,
  Box,
  Text,
  Select,
  Flex,
  Link
} from 'theme-ui'

import AfterSave from './AfterSave'

const NavBar = ({
  isTouched,
  onSave,
  data,
  setData
}) => (
  <Flex
    as="header"
    sx={{
      alignItems: 'center',
      variant: 'styles.header',
      bg: 'deep',
      p: 2
    }}
  >
    <Link
      to='/'
      sx={{
        variant: 'styles.navLink',
        p: 2,
        cursor: 'pointer'
      }}>
      <Text as="h4" sx={{ m: 0 }}>
        My Component Library
      </Text>
    </Link>
    <Text as="h4" sx={{ m: 0, variant: 'styles.navLink', }}>
        /
    </Text>
    <Select
      sx={{ ml: 2, variant: 'styles.navLink', pl: 2, pr: 4, py: 0, bg: 'rgba(255, 255, 255, .4)', border: 'none' }}
      defaultValue='A long value here'>
      <option>A long value here</option>
      <option>Hi</option>
      <option>Beep</option>
      <option>Boop</option>
    </Select>

    <Box sx={{ mx: 'auto' }} />
    <AfterSave data={data} setData={setData} />
    <Button onClick={() => isTouched && onSave()} variant={isTouched ? 'primary' : 'disabled'} mr={4}>
      Save Model
    </Button>
    {/* <Text
      sx={{
        variant: 'styles.deepNavLink',
        p: 2,
      }}>
      Editing slices/PascalCased/model.json
    </Text> */}

  </Flex>
)

export default NavBar