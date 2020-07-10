import Modal from 'react-modal'

import {
  Close,
  Flex,
  Heading
} from 'theme-ui'

import WidgetForm from './Form'

Modal.setAppElement("#__next");

const EditModal = ({
  close,
  data,
  Model
}) => {
  if (!data.isOpen) {
    return null
  }
  const {
    isOpen,
    fieldType,
    field: [apiId, initialModelValues]
  } = data
  return (
    <Modal
      isOpen={isOpen}
      shouldCloseOnOverlayClick
      onRequestClose={close}
      contentLabel="Widget Form Modal"
    >
      <Flex
        sx={{
          borderBottom: "1px solid #F1F1F1",
          justifyContent: "space-between",
        }}
      >
        <Heading>{ apiId }</Heading>
        <Close onClick={close} />
      </Flex>
      <WidgetForm
        apiId={apiId}
        Model={Model}
        fieldType={fieldType}
        initialModelValues={initialModelValues}
        onUpdateField={(key, value) => {
          if (key !== apiId) {
            Model.delete.at.primary(apiId)
            // Model.replace(apiId).at.primary(initialModelValues.type, key, value)
          }
          Model.append.to[fieldType](initialModelValues.type, key, value)
          close()
        }}
      />
    </Modal>
  )
}

export default EditModal