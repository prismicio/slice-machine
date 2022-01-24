/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Fragment } from "react";
import Modal from "react-modal";
import SliceMachineModal from "@components/SliceMachineModal";

import { Formik, Form, Field } from "formik";

import { Box, Label, Input, Heading, Button } from "theme-ui";

import { Flex as FlexGrid, Col } from "components/Flex";

import Card from "@components/Card/WithTabs/index";

const FORM_ID = "metadata-modal-form";

const InputBox = ({ name, label, placeholder }) => (
  <Box mb={2}>
    <Label
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
      htmlFor={name}
      mb={1}
    >
      {label}
    </Label>
    <Field
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
      name={name}
      type="text"
      placeholder={placeholder}
      as={Input}
    />
  </Box>
);

const MetaDataModal = ({ close, isOpen, Model }) => {
  Modal.setAppElement("#__next");

  const onUpdateField = (value) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    store.updateMetadata(Model, value);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    close();
  };

  return (
    <SliceMachineModal
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      isOpen={isOpen}
      shouldCloseOnOverlayClick
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      onRequestClose={close}
      contentLabel="MetaData Form Modal"
    >
      <Formik
        validateOnChange
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        initialValues={Model.meta}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars
        onSubmit={(values, _) => {
          onUpdateField(values);
        }}
      >
        {(props) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars
          const { values, errors, isValid, isSubmitting } = props;
          return (
            <Form id={FORM_ID}>
              <Card
                HeaderContent={<Heading as="h3">Update MetaData</Heading>}
                FooterContent={
                  <Fragment>
                    <Button
                      mr={2}
                      type="button"
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
                }
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
          );
        }}
      </Formik>
    </SliceMachineModal>
  );
};

export default MetaDataModal;
