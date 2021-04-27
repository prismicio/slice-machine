import { Field } from 'formik'
import  { Box, Label, Input }from 'theme-ui'

import { Col, Flex as FlexGrid } from 'components/Flex'

import ModalFormCard from '../ModalFormCard'

const InputBox = ({ name, label, placeholder }:{ name: string, label: string, placeholder: string, }) => (
  <Box mb={2}>
    <Label htmlFor={name} mb={1}>
      { label }
    </Label>
    <Field
      name={name}
      type="text"
      placeholder={placeholder}
      as={Input}
    />
  </Box>
)

const formId = "create-custom-type"

const CreateCustomtypeForm = ({
  isOpen,
  onSubmit,
  close
}: { isOpen: boolean, onSubmit: Function, close: Function }) => {
  return (
    <ModalFormCard
      isOpen={isOpen}
      formId={formId}
      close={() => close()}
      onSubmit={(values: {}) => {
        console.log({values })
        onSubmit(values)
      }}
      content={{
        title: 'New Custom Type',
      }}
    >
      {() => (
        <FlexGrid>
          <Col>
            <InputBox
              name="id"
              label="Custom Type ID"
              placeholder="my-custom-type"
            />
          </Col>
          <Col>
            <InputBox
              name="label"
              label="Custom Type Label"
              placeholder="My Custom Type"
            />
          </Col>
        </FlexGrid>
      )}
    </ModalFormCard>
  )
}

export default CreateCustomtypeForm
