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

const CardsOrder = [
  `${Widgets.StructuredText.TYPE_NAME}`,
  `${Widgets.Image.TYPE_NAME}`,
  `${Widgets.Link.TYPE_NAME}`,
  `${Widgets.Select.TYPE_NAME}`,
  `${Widgets.Boolean.TYPE_NAME}`,
  `${Widgets.Date.TYPE_NAME}`,
  `${Widgets.Timestamp.TYPE_NAME}`,
  `${Widgets.Embed.TYPE_NAME}`,
  `${Widgets.Number.TYPE_NAME}`,
  `${Widgets.GeoPoint.TYPE_NAME}`,
  `${Widgets.Color.TYPE_NAME}`,
  `${Widgets.Text.TYPE_NAME}`,
]

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
              bg: 'headSection',
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
            CardsOrder.map((typeName) => {
              const widget = Widgets[typeName]
              const { Meta } = widget
              return (
                  <Col key={typeName}>
                    <FieldTypeCard
                      {...Meta}
                      onSelect={() => onSelect(zone, typeName) && close()}
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