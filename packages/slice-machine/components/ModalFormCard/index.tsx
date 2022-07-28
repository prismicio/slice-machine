import Modal from "react-modal";
import SliceMachineModal from "@components/SliceMachineModal";
import { Formik, Form, FormikErrors, FormikTouched } from "formik";
import { Flex, Heading, Close, Box, Button as ThemeButton } from "theme-ui";
import Button from "@components/Button";

import Card from "../Card";
import { SetStateAction } from "react";

type ModalCardProps<T> = {
  children: (props: {
    isValid: boolean;
    isSubmitting: boolean;
    errors: FormikErrors<T>;
    touched: FormikTouched<T>;
    setFieldValue: (
      field: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: any,
      shouldValidate?: boolean | undefined
    ) => void;
    values: T;
    setValues: (
      values: SetStateAction<T>,
      shouldValidate?: boolean | undefined
    ) => void;
  }) => JSX.Element;
  close: () => void;
  isOpen: boolean;
  formId: string;
  buttonLabel?: string;
  validate?: (values: T) => FormikErrors<T> | void;
  widthInPx?: string;
  onSubmit: (values: T) => void;
  initialValues: T;
  content: { title: string };
  cardProps?: React.ComponentProps<typeof Card>;
  omitFooter?: boolean;
  isLoading?: boolean;
  dataCy?: string;
};

function ModalCard<Values>({
  children,
  close,
  isOpen,
  formId,
  validate,
  onSubmit,
  widthInPx,
  initialValues,
  content: { title },
  cardProps,
  omitFooter = false,
  isLoading = false,
  buttonLabel = "Save",
  dataCy,
}: ModalCardProps<Values>): JSX.Element {
  Modal.setAppElement("#__next");
  return (
    <SliceMachineModal
      isOpen={isOpen}
      shouldCloseOnOverlayClick
      onRequestClose={close}
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
        onSubmit={(values) => {
          onSubmit(values);
        }}
      >
        {({
          isValid,
          isSubmitting,
          values,
          errors,
          touched,
          setFieldValue,
          setValues,
        }) => (
          <Form id={formId} {...(dataCy ? { "data-cy": dataCy } : null)}>
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
                  <Close type="button" onClick={close} />
                </Flex>
              )}
              Footer={
                !omitFooter ? (
                  <Flex sx={{ alignItems: "space-between" }}>
                    <Box sx={{ ml: "auto" }} />
                    <ThemeButton
                      mr={2}
                      type="button"
                      onClick={close}
                      variant="secondary"
                    >
                      Cancel
                    </ThemeButton>
                    <Button
                      form={formId}
                      type="submit"
                      disabled={!isValid || isSubmitting || isLoading}
                      isLoading={isLoading}
                    >
                      {buttonLabel}
                    </Button>
                  </Flex>
                ) : null
              }
            >
              {children({
                isValid,
                isSubmitting,
                values,
                errors,
                touched,
                setFieldValue,
                setValues,
              })}
            </Card>
          </Form>
        )}
      </Formik>
    </SliceMachineModal>
  );
}

export default ModalCard;
