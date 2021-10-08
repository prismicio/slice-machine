import Modal from "react-modal";
import SliceMachineModal from "@components/SliceMachineModal";
import { Formik, Form, Field } from "formik";
import {
  Box,
  Button,
  Card,
  Close,
  Flex,
  Heading,
  Input,
  Text,
  Textarea,
} from "theme-ui";

Modal.setAppElement("#__next");

type ReviewModalProps = {
  close: Function;
  isOpen: boolean;
  onSubmit: (rating: number, comment: string) => void;
  cardProps?: {};
};

const ReviewModal: React.FunctionComponent<ReviewModalProps> = ({
  close,
  isOpen,
  onSubmit,
}) => {
  const validateReview = ({ rating }: { rating: number; comment: string }) => {
    if (!rating) {
      return { id: "Please Choose a rating" };
    }
  };

  return (
    <SliceMachineModal
      isOpen={isOpen}
      shouldCloseOnOverlayClick={false}
      onRequestClose={() => close()}
      closeTimeoutMS={500}
      contentLabel={"Review Modal"}
      portalClassName={"ReviewModal"}
      style={{
        content: {
          display: "flex",
          position: "initial",
          padding: "none",
          top: "initial",
          left: "initial",
          minHeight: "initial",
        },
        overlay: {
          top: "initial",
          left: "initial",
          right: 16,
          bottom: 16,
          position: "absolute",
          height: "fit-content",
          width: "fit-content",
          backgroundColor: "unset",
        },
      }}
    >
      <Formik
        validateOnMount
        validateOnChange
        initialValues={{
          rating: 0,
          comment: "",
        }}
        validate={validateReview}
        onSubmit={(values) => {
          onSubmit(values.rating, values.comment);
          close();
        }}
      >
        {({ isValid, isSubmitting }) => (
          <Form id="review-form">
            <Card>
              <Flex
                sx={{
                  p: "16px",
                  pl: 4,
                  bg: "headSection",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: "8px 8px 0px 0px",
                  borderBottom: (t) => `1px solid ${t.colors?.borders}`,
                }}
              >
                <Heading sx={{ fontSize: "20px", mr: 4 }}>
                  Do you like the slice machine?
                </Heading>
                <Close type="button" onClick={() => close()} />
              </Flex>
              <Flex
                sx={{
                  flexDirection: "column",
                  padding: "16px 24px 32px",
                  bg: "headSection",
                }}
              >
                <Text variant={"xs"} as={"p"} sx={{ maxWidth: 302, mb: 3 }}>
                  How would you rate your experience using Slice Machine?
                </Text>
                <Box mb={3}>
                  <Field
                    name={"rating"}
                    type="number"
                    placeholder={"Rating"}
                    as={Input}
                    autoComplete="off"
                  />
                </Box>
                <Box mb={3}>
                  <Field
                    name={"comment"}
                    type="text"
                    placeholder={"Tell us more (optional)"}
                    as={Textarea}
                    autoComplete="off"
                    sx={{
                      height: 80,
                    }}
                  />
                </Box>
                <Button
                  form={"review-form"}
                  type="submit"
                  disabled={!isValid || isSubmitting}
                >
                  Submit rating
                </Button>
              </Flex>
            </Card>
          </Form>
        )}
      </Formik>
    </SliceMachineModal>
  );
};

export default ReviewModal;
