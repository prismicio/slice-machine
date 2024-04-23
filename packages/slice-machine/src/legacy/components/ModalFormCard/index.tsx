import {
  Form,
  Formik,
  FormikErrors,
  FormikProps,
  FormikTouched,
  FormikValues,
} from "formik";
import type {
  ComponentPropsWithoutRef,
  ReactNode,
  SetStateAction,
} from "react";
import Modal from "react-modal";
import { Button as ThemeButton, Close, Flex, Heading } from "theme-ui";

import { Button } from "@/legacy/components/Button";
import SliceMachineModal from "@/legacy/components/SliceMachineModal";

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
      shouldValidate?: boolean | undefined,
    ) => Promise<void | FormikErrors<FormikValues>>;
    values: T;
    setValues: (
      values: SetStateAction<T>,
      shouldValidate?: boolean | undefined,
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
  cardProps?: ComponentPropsWithoutRef<typeof Card>;
  omitFooter?: boolean;
  isLoading?: boolean;
  testId?: string;
  actionMessage?: ((props: FormikProps<T>) => ReactNode) | ReactNode;
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
  testId,
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
              {...(testId != null ? { "data-testid": testId } : null)}
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
