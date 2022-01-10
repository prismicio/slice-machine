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
import { useContext } from "react";
import { CustomTypesContext } from "@src/models/customTypes/context";
import { LibrariesContext } from "@src/models/libraries/context";
import { TrackerContext } from "@src/utils/tracker";
import {
  userHasDoneTheOnboarding,
  userHasSendAReview,
} from "@src/modules/userContext";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { getEnvironment } from "@src/modules/environment";

Modal.setAppElement("#__next");

type ReviewModalProps = {
  cardProps?: {};
};

const ratingSelectable = [1, 2, 3, 4, 5, 6, 7];

const SelectReviewComponent = ({ field, form }: FieldProps) => {
  return (
    <Box sx={{ mb: 3 }}>
      {ratingSelectable.map((rating, index) => (
        <Button
          variant="secondary"
          type="button"
          key={index}
          onClick={() => form.setFieldValue("rating", rating)}
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
        >
          {rating}
        </Button>
      ))}
    </Box>
  );
};

const ReviewModal: React.FunctionComponent<ReviewModalProps> = () => {
  const { customTypes } = useContext(CustomTypesContext);
  const libraries = useContext(LibrariesContext);
  const tracker = useContext(TrackerContext);

  const {
    env,
    isReviewLoading,
    isLoginModalOpen,
    hasSendAReview,
    hasDoneTheOnboarding,
  } = useSelector((store: SliceMachineStoreType) => ({
    env: getEnvironment(store),
    isReviewLoading: isLoading(store, LoadingKeysEnum.REVIEW),
    isLoginModalOpen: isModalOpen(store, ModalKeysEnum.LOGIN),
    hasSendAReview: userHasSendAReview(store),
    hasDoneTheOnboarding: userHasDoneTheOnboarding(store),
  }));

  const { skipReview, sendAReview, startLoadingReview, stopLoadingReview } =
    useSliceMachineActions();

  const sliceCount =
    libraries && libraries.length
      ? libraries.reduce((count, lib) => {
          if (!lib) {
            return count;
          }

          return count + lib.components.length;
        }, 0)
      : 0;

  const customTypeCount = !!customTypes ? customTypes.length : 0;

  const userHasCreateEnoughContent = sliceCount >= 1 && customTypeCount >= 1;

  const onSendAReview = (rating: number, comment: string): void => {
    startLoadingReview();
    tracker?.Track.review(env.framework, rating, comment);
    sendAReview();
    stopLoadingReview();
  };

  const validateReview = ({ rating }: { rating: number; comment: string }) => {
    if (!rating) {
      return { id: "Please Choose a rating" };
    }
  };

  return (
    <SliceMachineModal
      isOpen={
        userHasCreateEnoughContent && !hasSendAReview && hasDoneTheOnboarding
      }
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
        {({ isValid, values }) => (
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
                  Give us your opinion
                </Heading>
                <Close
                  type="button"
                  onClick={() => skipReview()}
                  data-cy="close-review"
                />
              </Flex>
              <Flex
                sx={{
                  flexDirection: "column",
                  padding: "16px 24px 32px",
                  bg: "headSection",
                }}
              >
                <Text variant={"xs"} as={"p"} sx={{ maxWidth: 302, mb: 3 }}>
                  Overall, how difficult was your first experience using
                  Slicemachine?
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
                    Very difficult
                  </Text>
                  <Text variant={"xs"} as={"p"}>
                    Very easy
                  </Text>
                </Box>
                <Field name={"rating"} component={SelectReviewComponent} />
                <Field
                  name={"comment"}
                  type="text"
                  placeholder={
                    "Sorry about that! What did you find the most difficult?"
                  }
                  as={Textarea}
                  autoComplete="off"
                  className={
                    values.rating >= 5 || values.rating === 0 ? "hidden" : ""
                  }
                  sx={{
                    height: 80,
                    opacity: 1,
                    mb: 3,
                    transition: "all 300ms",
                    "&.hidden": {
                      height: 0,
                      opacity: 0,
                      mb: 0,
                      p: 0,
                      border: "none",
                    },
                  }}
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
