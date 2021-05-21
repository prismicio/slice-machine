import Modal from 'react-modal'

import {
  Close,
  Flex,
  Heading
} from 'theme-ui'

import Card from 'components/Card'
import { Flex as FlexGrid, Col } from 'components/Flex'

import FieldTypeCard from './FieldTypeCard'

Modal.setAppElement("#__next");

const SelectFieldTypeModal = ({
  data,
  close,
  onSelect,
  widgetsArray,
}) => {
  if (!data.isOpen) {
    return null
  }

  console.log({
    widgetsArray
  })
  return (
    <Modal
      isOpen
      shouldCloseOnOverlayClick
      onRequestClose={close}
      contentLabel="Widget Form Modal"
      style = {
        {
          overlay: {
            overflow: 'auto',
          },
        }
      }
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
              bg: 'headSection',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTopLeftRadius: radius,
              borderTopRightRadius: radius,
              borderBottom: t => `1px solid ${t.colors?.borders}`
            }}
          >
            <Heading>Add a new field</Heading>
            <Close onClick={close} />
          </Flex>
        )}
      >
        <FlexGrid>
          {
            widgetsArray.filter(e => e).map((widget) => {
              const { Meta, TYPE_NAME, CUSTOM_NAME } = widget
              return (
                  <Col key={CUSTOM_NAME || TYPE_NAME}>
                    <FieldTypeCard
                      {...Meta}
                      onSelect={() => onSelect(CUSTOM_NAME || TYPE_NAME)}
                    />
                  </Col>
                )
            })
          }
        </FlexGrid>
      </Card>
    </Modal>
  )
}

export default SelectFieldTypeModal