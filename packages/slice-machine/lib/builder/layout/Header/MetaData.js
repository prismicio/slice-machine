import { Fragment } from 'react'
import Modal from 'react-modal'
import { Formik, Form, Field } from 'formik'

import {
  Box,
  Label,
  Input,
  Heading,
  Button,
} from 'theme-ui'

import { Flex as FlexGrid, Col } from 'components/Flex'

import Card from 'components/Card/WithTabs'

Modal.setAppElement("#__next");

const FORM_ID = 'metadata-modal-form'

const InputBox = ({ name, label, placeholder }) => (
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

const MetaDataModal = ({
  close,
  isOpen,
  Model,
}) => {

  const onUpdateField = (value) => {
    Model.hydrate(() => Model.appendInfo(value))
    close()
  }

  return (
    <Modal
      isOpen={isOpen}
      shouldCloseOnOverlayClick
      onRequestClose={close}
      contentLabel="MetaData Form Modal"
    >
      <Formik
        validateOnChange
        initialValues={Model.meta}
        onSubmit={(values, _) => {
          onUpdateField(values)
        }}
      >
        {(props) => {
          const {
            values,
            errors,
            isValid,
            isSubmitting,
          } = props
          return (
            <Form id={FORM_ID}>
              <Card
                HeaderContent={<Heading as="h3">Update MetaData</Heading>}
                FooterContent={(
                  <Fragment>
                    <Button
                      mr={2}
                      type="button"
                      onClick={close}
                      variant="secondary"
                      >
                      Cancel
                    </Button>
                    <Button
                      form={FORM_ID}
                      type="submit"
                      disabled={!isValid || isSubmitting}
                    >
                      Save
                    </Button>
                  </Fragment>
                )}
              >
                <FlexGrid>
                  <Col>
                    <InputBox
                      name="sliceName"
                      label="Slice Name"
                      placeholder="Name of your slice"
                    />
                    <InputBox
                      name="description"
                      label="Slice description"
                      placeholder="Description of your slice"
                    />
                  </Col>
                  <Col>
                    <InputBox
                      name="id"
                      label="Slice id"
                      placeholder="ID of your slice"
                    />
                  </Col>
                </FlexGrid>
              </Card>
            </Form>
          )}}
      </Formik>
    </Modal>
  )
}

export default MetaDataModal
