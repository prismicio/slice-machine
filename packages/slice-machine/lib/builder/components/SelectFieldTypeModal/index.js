import Modal from 'react-modal'

import {
  Close,
  Flex,
  Heading
} from 'theme-ui'

import * as Widgets from '../../../widgets'
import FieldTypeCard from './FieldTypeCard'

Modal.setAppElement("#__next");

const SelectFieldTypeModal = ({
  data,
  close,
  onSelect,
}) => {
  if (!data.isOpen) {
    return null
  }
  const { zone, isOpen } = data
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
        mb={4}
      >
        <Heading>Select a field type</Heading>
        <Close onClick={close} />
      </Flex>
      {
        Object.entries(Widgets).map(([type, widget]) => {
          const {
            Meta,
          } = widget
          if (Meta) { // prov
            return (
              <FieldTypeCard 
                key={type}
                {...Meta} 
                onSelect={() => onSelect(zone, type) && close()}
              />
            )
          }
          return null
        })
}
    </Modal>
  )
}

export default SelectFieldTypeModal