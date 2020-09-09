import Modal from 'react-modal'

import {
  Close,
  Flex,
  Heading
} from 'theme-ui'

import Card from 'components/Card'
import { Flex as FlexGrid, Col } from 'components/Flex'

import * as Widgets from 'lib/widgets'
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
       <Card
        borderFooter
        footerSx={{ p: 3 }}
        bodySx={{ pt: 2, pb: 4, px: 4 }}
        sx={{ border: 'none' }}
        Header={({ radius }) => (
          <Flex
            sx={{
              p: 3,
              pl: 4,
              bg: '#FFF',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTopLeftRadius: radius,
              borderTopRightRadius: radius,
              borderBottom: t => `1px solid ${t.colors.borders}`
            }}
          >
            <Heading>Add a new field</Heading>
            <Close onClick={close} />
          </Flex>
        )}
      >
        <FlexGrid>
          {
            Object.entries(Widgets).map(([type, widget]) => {
              const {
                Meta,
                create
              } = widget
              if (Meta && create) { // prov
                return (
                  <Col key={type}>
                    <FieldTypeCard 
                      {...Meta} 
                      onSelect={() => onSelect(zone, type) && close()}
                    />
                  </Col>
                )
              }
              return null
            })
          }
        </FlexGrid>
      </Card>
      {/* <Flex
        sx={{
          borderBottom: "1px solid #F1F1F1",
          justifyContent: "space-between",
        }}
        mb={4}
      >
        <Heading>Select a field type</Heading>
        <Close onClick={close} />
      </Flex> */}
    </Modal>
  )
}

export default SelectFieldTypeModal