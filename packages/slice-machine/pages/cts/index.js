import Link from 'next/link'
import { useContext } from 'react'
import { Box, Button } from 'theme-ui'
import { CustomTypesContext } from "../../src/models/customTypes/context"

const CustomTypes = () => {
  const { customTypes, onCreate } = useContext(CustomTypesContext)

  const _onCreate = () => {
    onCreate('MyCt', {
      repeatable: false,
      title: 'My Cool Slice',
    })
  }

  console.log(customTypes)
  return (
    <Box p={4}>
      <h3>Custom Types</h3>
      <Button type="button" onClick={_onCreate}>New Custom Type</Button>
      <ul>
        {
          customTypes.map((ct) => (
            <Link passHref href={`/cts/${ct.id}`} key={ct.id}>
              <a style={{ display: 'block' }}>
                - {ct.title}
              </a>
            </Link>
          ))
        }
      </ul>
    </Box>
  )
}

export default CustomTypes