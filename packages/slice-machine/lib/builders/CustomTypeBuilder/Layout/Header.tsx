import { CustomTypeState, CustomTypeStatus } from '../../../models/ui/CustomTypeState'
import { useToasts } from 'react-toast-notifications'
import { handleRemoteResponse } from '../../../../src/ToastProvider/utils'

import { Box, Button, Heading, Flex } from 'theme-ui'

import CustomTypeStore from '../../../../src/models/customType/store'


import FlexWrapper from './FlexWrapper'

const Header = ({ Model, store }: { Model: CustomTypeState, store: CustomTypeStore }) => {
  const { addToast } = useToasts()

  const buttonProps = (() => {
    if (Model.isTouched) {
      return { onClick: () => store.save(Model), children: 'Save to File System' }
    }
    if ([CustomTypeStatus.New, CustomTypeStatus.Modified].includes(Model.__status)) {
      return {
        onClick: () => store.push(Model, data => {
          console.log({ loading: data.loading })
        }),
        children: 'Push to Prismic'
      }
    }
    return { variant: "disabled", children: 'Synced with Prismic' }
  })()

  return (
    <Box sx={{ bg: 'backgroundClear' }}>
      <FlexWrapper
        sx={{
          py: 4,
        }}
      >

        <Box
          as="section"
          sx={{
            flexGrow: 99999,
            flexBasis: 0,
            minWidth: 320,
          }}
        >
          <Heading>Templates <Box
            as="span"
            sx={{
              fontWeight: '400'
            }}
          >/ {Model.label}</Box></Heading>
        </Box>
        <Button {...buttonProps} />
      </FlexWrapper>
    </Box>
  )
}

export default Header
