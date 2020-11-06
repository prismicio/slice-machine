import { Button, Flex, Spinner } from 'theme-ui'

const FooterButton = ({ info, isTouched, onSave, onPush, loading }) => {
  const text = (() => {
    if (isTouched) {
      return 'Save model to filesystem'
    }
    return 'Push Slice to Prismic'
  })()
  
  const onClick = isTouched ? onSave : onPush

  const editable = info.isNew || isTouched || info.isModified

  return (
    <Flex
      as={Button}
      sx={{
        width: '100%',
        borderTopRightRadius: '0',
        borderTopLeftRadius: '0',
        cursor: 'pointer',
        p: 3,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      variant={editable ? 'buttons.primary' : 'buttons.disabled'}
      disabled={!editable}
      onClick={editable ? onClick : null}
    >
       { loading ? <Spinner color="#F7F7F7" size={24} mr={2} /> : null } {text}
    </Flex>
  )
}

export default FooterButton