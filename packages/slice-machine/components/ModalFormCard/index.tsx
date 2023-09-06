import Modal from "react-modal";
import SliceMachineModal from "@components/SliceMachineModal";
import {
  Formik,
  Form,
  FormikErrors,
  FormikTouched,
  FormikValues,
  FormikProps,
} from "formik";
import { SetStateAction } from "react";
import { Flex, Heading, Close, Button as ThemeButton } from "theme-ui";

import { Button } from "@components/Button";
import Card from "../Card";

type ModalCardProps<T extends FormikValues> = {
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
    ) => Promise<void | FormikErrors<FormikValues>>;
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
  actionMessage?:
    | ((props: FormikProps<T>) => React.ReactNode)
    | React.ReactNode;
};

function ModalCard<Values extends FormikValues>({
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
  actionMessage,
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
          width: widthInPx ?? "900px",
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
        {(formikProps) => {
          const {
            isValid,
            isSubmitting,
            values,
            errors,
            touched,
            setFieldValue,
            setValues,
          } = formikProps;

          return (
            <Form
              id={formId}
              {...(dataCy != null ? { "data-cy": dataCy } : null)}
            >
              <Card
                borderFooter
                footerSx={{
                  p: 3,
                  position: "sticky",
                  bottom: 0,
                  background: "gray",
                }}
                bodySx={{ px: 4, py: 4 }}
                sx={{ border: "none" }}
                {...cardProps}
                Header={({ radius }: { radius: string | number }) => (
                  <Flex
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
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
                    <Flex
                      sx={{
                        alignItems: "space-between",
                      }}
                    >
                      <Flex sx={{ fontSize: "14px", alignItems: "center" }}>
                        {typeof actionMessage === "function"
                          ? actionMessage(formikProps)
                          : actionMessage}
                      </Flex>
                      <Flex sx={{ ml: "auto" }}>
                        <ThemeButton
                          mr={2}
                          type="button"
                          onClick={close}
                          variant="secondary"
                          disabled={isSubmitting || isLoading}
                        >
                          Cancel
                        </ThemeButton>
                        <Button
                          label={buttonLabel}
                          form={formId}
                          type="submit"
                          disabled={!isValid || isSubmitting || isLoading}
                          isLoading={isSubmitting || isLoading}
                          sx={{
                            fontWeight: "400",
                            paddingBlock: "8px",
                            paddingInline: "16px",
                            fontSize: "14px",
                            borderRadius: "4px",
                          }}
                        />
                      </Flex>
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
          );
        }}
      </Formik>
    </SliceMachineModal>
  );
}

export default ModalCard;
