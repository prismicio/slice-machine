import Modal from "react-modal";
import SliceMachineModal from "@components/SliceMachineModal";
import { Formik, Form } from "formik";
import { Button, Card } from "theme-ui";

Modal.setAppElement("#__next");

type ReviewModalProps = {
  close: Function;
  isOpen: boolean;
  formId: string;
  validate?: Function;
  onSubmit: Function;
  initialValues?: any;
  cardProps?: {};
};

const ReviewModal: React.FunctionComponent<ReviewModalProps> = ({
  close,
  isOpen,
  formId,
  validate,
  onSubmit,
  initialValues = {},
}) => (
  <SliceMachineModal
    isOpen={isOpen}
    shouldCloseOnOverlayClick
    onRequestClose={() => close()}
    contentLabel={"Review Modal"}
    style={{
      content: {
        width: "900px",
        bottom: 16,
      },
      overlay: {
        backgroundColor: "transparent",
        backdropFilter: "none",
      },
    }}
  >
    <Formik
      validateOnChange
      initialValues={initialValues}
      validate={(values) => (validate ? validate(values) : undefined)}
      onSubmit={(values, _) => {
        onSubmit(values);
        close();
      }}
    >
      {({ isValid, isSubmitting, values, errors, touched, setFieldValue }) => (
        <Form id={formId}>
          <Card>
            <Button
              form={formId}
              type="submit"
              disabled={!isValid && isSubmitting}
            >
              Save
            </Button>
          </Card>
        </Form>
      )}
    </Formik>
  </SliceMachineModal>
);

export default ReviewModal;
