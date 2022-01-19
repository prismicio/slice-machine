import Modal from "react-modal";
import SliceMachineModal from "@components/SliceMachineModal";
import { Formik, Form } from "formik";
import { Flex, Heading, Close, Box, Button } from "theme-ui";

import Card from "../Card";

Modal.setAppElement("#__next");

const ModalCard = ({
  children,
  close,
  isOpen,
  formId,
  validate,
  onSubmit,
  widthInPx,
  initialValues = {},
  content: { title },
  cardProps,
  omitFooter,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any;
  // eslint-disable-next-line @typescript-eslint/ban-types
  close: Function;
  isOpen: boolean;
  formId: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  validate?: Function;
  // eslint-disable-next-line @typescript-eslint/ban-types
  widthInPx?: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  onSubmit: Function;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialValues?: any;
  content: { title: string };
  // eslint-disable-next-line @typescript-eslint/ban-types
  cardProps?: {};
  omitFooter?: boolean;
}) => (
  <SliceMachineModal
    isOpen={isOpen}
    shouldCloseOnOverlayClick
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    onRequestClose={() => close()}
    contentLabel={title}
    style={{
      content: {
        width: widthInPx || "900px",
      },
    }}
  >
    <Formik
      validateOnChange
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      initialValues={initialValues}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      validate={(values) => (validate ? validate(values) : undefined)}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onSubmit={(values, _) => {
        onSubmit(values);
        close();
      }}
    >
      {({ isValid, isSubmitting, values, errors, touched, setFieldValue }) => (
        <Form id={formId}>
          <Card
            borderFooter
            footerSx={{ p: 3 }}
            bodySx={{ px: 4, py: 4 }}
            sx={{ border: "none" }}
            {...cardProps}
            Header={({ radius }: { radius: string | number }) => (
              <Flex
                sx={{
                  p: "16px",
                  pl: 4,
                  bg: "headSection",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTopLeftRadius: radius,
                  borderTopRightRadius: radius,
                  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                  borderBottom: (t) => `1px solid ${t.colors?.borders}`,
                }}
              >
                <Heading sx={{ fontSize: "20px" }}>{title}</Heading>

                <Close
                  type="button"
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                  onClick={() => close()}
                />
              </Flex>
            )}
            Footer={
              !omitFooter ? (
                <Flex sx={{ alignItems: "space-between" }}>
                  <Box sx={{ ml: "auto" }} />
                  <Button
                    mr={2}
                    type="button"
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    onClick={() => close()}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    form={formId}
                    type="submit"
                    disabled={!isValid && isSubmitting}
                  >
                    Save
                  </Button>
                </Flex>
              ) : null
            }
          >
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call */}
            {children({
              isValid,
              isSubmitting,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              values,
              errors,
              touched,
              setFieldValue,
            })}
          </Card>
        </Form>
      )}
    </Formik>
  </SliceMachineModal>
);

export default ModalCard;
