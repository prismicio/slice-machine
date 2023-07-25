import Modal from "react-modal";
import SliceMachineModal from "@components/SliceMachineModal";
import { Field, FieldProps, Form, Formik } from "formik";
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
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { isModalOpen } from "@src/modules/modal";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import {
  getLastSyncChange,
  userHasSendAReview,
} from "@src/modules/userContext";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { telemetry } from "@src/apiClient";
import { selectAllCustomTypes } from "@src/modules/availableCustomTypes";
import { getLibraries } from "@src/modules/slices";
import { hasLocal } from "@lib/models/common/ModelData";

Modal.setAppElement("#__next");

const ratingSelectable = [1, 2, 3, 4, 5];

const SelectReviewComponent = ({ field, form }: FieldProps) => {
  return (
    <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
      {ratingSelectable.map((rating, index) => (
        <Button
          variant="secondary"
          type="button"
          key={index}
          onClick={() => void form.setFieldValue("rating", rating)}
          className={field.value === rating ? "selected" : ""}
          sx={{
            "&:not(:last-of-type)": {
              mr: 1,
            },
            "&.selected": {
              backgroundColor: "code.gray",
              color: "white",
            },
          }}
          data-cy={`review-form-score-${rating}`}
        >
          {rating}
        </Button>
      ))}
    </Box>
  );
};

const ReviewModal: React.FunctionComponent = () => {
  const {
    isReviewLoading,
    isLoginModalOpen,
    hasSendAReview,
    customTypes,
    libraries,
    lastSyncChange,
  } = useSelector((store: SliceMachineStoreType) => ({
    isReviewLoading: isLoading(store, LoadingKeysEnum.REVIEW),
    isLoginModalOpen: isModalOpen(store, ModalKeysEnum.LOGIN),
    hasSendAReview: userHasSendAReview(store),
    customTypes: selectAllCustomTypes(store),
    libraries: getLibraries(store),
    lastSyncChange: getLastSyncChange(store),
  }));

  const { skipReview, sendAReview, startLoadingReview, stopLoadingReview } =
    useSliceMachineActions();

  const sliceCount =
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    libraries && libraries.length
      ? libraries.reduce((count, lib) => {
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          if (!lib) return count;
          return count + lib.components.length;
        }, 0)
      : 0;

  const hasSliceWithinCustomType = customTypes.some(
    (customType) =>
      hasLocal(customType) &&
      customType.local.tabs.some(
        (tab) => tab.sliceZone && tab.sliceZone?.value.length > 0
      )
  );

  const hasPushedAnHourAgo = Boolean(
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    lastSyncChange && Date.now() - lastSyncChange >= 3600000
  );

  const userHasCreatedEnoughContent =
    sliceCount >= 1 &&
    customTypes.length >= 1 &&
    hasSliceWithinCustomType &&
    hasPushedAnHourAgo;

  const onSendAReview = (rating: number, comment: string): void => {
    startLoadingReview();
    void telemetry.track({ event: "review", rating, comment });
    sendAReview();
    stopLoadingReview();
  };

  const validateReview = ({ rating }: { rating: number; comment: string }) => {
    if (!rating) {
      return { id: "Please choose a rating" };
    }
  };

  return (
    <SliceMachineModal
      isOpen={userHasCreatedEnoughContent && !hasSendAReview}
      shouldCloseOnOverlayClick={false}
      onRequestClose={() => skipReview()}
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
          right: 32,
          bottom: 32,
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
                  Share Feedback
                </Heading>
                <Close type="button" onClick={() => skipReview()} />
              </Flex>
              <Flex
                sx={{
                  flexDirection: "column",
                  padding: "16px 24px 32px",
                  bg: "headSection",
                }}
              >
                <Text variant={"xs"} as={"p"} sx={{ maxWidth: 302, mb: 3 }}>
                  Overall, how satisfied are you with your Slice Machine
                  experience?
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
                <Field name={"rating"} component={SelectReviewComponent} />
                <Field
                  name={"comment"}
                  type="text"
                  placeholder="Share your thoughts. What can we improve?"
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

export default ReviewModal;
