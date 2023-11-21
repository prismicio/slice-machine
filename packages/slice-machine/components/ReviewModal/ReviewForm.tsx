import { FC } from "react";
import { Field, Form, Formik } from "formik";
import {
  Box,
  Button,
  Card,
  Close,
  Flex,
  Heading,
  Text,
  Textarea,
} from "theme-ui";
import Modal from "react-modal";
import { useSelector } from "react-redux";

import SliceMachineModal from "@components/SliceMachineModal";
import { SliceMachineStoreType } from "@src/redux/type";
import { isModalOpen } from "@src/modules/modal";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { telemetry } from "@src/apiClient";
import { UserReviewType } from "@src/modules/userContext/types";

import { ReviewFormSelect } from "./ReviewFormSelect";

Modal.setAppElement("#__next");

type ReviewFormProps = {
  reviewType: UserReviewType;
};

export const ReviewForm: FC<ReviewFormProps> = (props) => {
  const { reviewType } = props;
  const { isReviewLoading, isLoginModalOpen } = useSelector(
    (store: SliceMachineStoreType) => ({
      isReviewLoading: isLoading(store, LoadingKeysEnum.REVIEW),
      isLoginModalOpen: isModalOpen(store, ModalKeysEnum.LOGIN),
    }),
  );
  const { skipReview, sendAReview, startLoadingReview, stopLoadingReview } =
    useSliceMachineActions();

  const onSendAReview = (rating: number, comment: string): void => {
    startLoadingReview();
    void telemetry.track({
      event: "review",
      rating,
      comment,
      type:
        reviewType === "advancedRepository"
          ? "advanced repository"
          : "onboarding",
    });
    sendAReview(reviewType);
    stopLoadingReview();
  };

  const validateReview = ({ rating }: { rating: number; comment: string }) => {
    if (!rating) {
      return { id: "Please choose a rating" };
    }
  };

  return (
    <SliceMachineModal
      isOpen
      shouldCloseOnOverlayClick={false}
      onRequestClose={() => skipReview(reviewType)}
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
          onSendAReview(values.rating, values.comment);
        }}
      >
        {({ isValid }) => (
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
                  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                  borderBottom: (t) => `1px solid ${t.colors?.borders}`,
                }}
              >
                <Heading sx={{ fontSize: "20px", mr: 4 }}>
                  Share feedback
                </Heading>
                <Close type="button" onClick={() => skipReview(reviewType)} />
              </Flex>
              <Flex
                sx={{
                  flexDirection: "column",
                  padding: "16px 24px 32px",
                  bg: "headSection",
                }}
              >
                <Text variant={"xs"} as={"p"} sx={{ maxWidth: 302, mb: 3 }}>
                  Overall, how satisfied or dissatisfied are you with your Slice
                  Machine experience so far?
                </Text>
                <Box
                  mb={2}
                  sx={{
                    display: "flex",
                    flex: 1,
                    justifyContent: "space-between",
                  }}
                >
                  <Text variant={"xs"} as={"p"}>
                    Very unsatisfied
                  </Text>
                  <Text variant={"xs"} as={"p"}>
                    Very satisfied
                  </Text>
                </Box>
                <Field name={"rating"} component={ReviewFormSelect} />
                <Field
                  name={"comment"}
                  type="text"
                  placeholder="Tell us more..."
                  as={Textarea}
                  autoComplete="off"
                  sx={{ height: 80, mb: 3 }}
                  data-cy="review-form-comment"
                />
                <Button
                  form={"review-form"}
                  type="submit"
                  disabled={!isValid || isReviewLoading || isLoginModalOpen}
                >
                  Submit
                </Button>
              </Flex>
            </Card>
          </Form>
        )}
      </Formik>
    </SliceMachineModal>
  );
};
