import { useDispatch } from "react-redux";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { modalCloseCreator, modalOpenCreator } from "@src/modules/modal";
import {
  startLoadingActionCreator,
  stopLoadingActionCreator,
} from "@src/modules/loading";
import {
  finishOnboardingCreator,
  sendAReviewCreator,
  skipReviewCreator,
} from "@src/modules/userContext";
import { getEnvironmentCreator } from "@src/modules/environment";
import { ServerState } from "@models/server/ServerState";

const useSliceMachineActions = () => {
  const dispatch = useDispatch();

  // Modal store
  const closeLoginModal = () =>
    dispatch(modalCloseCreator({ modalKey: ModalKeysEnum.LOGIN }));
  const openLoginModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }));
  const closeUpdateVersionModal = () =>
    dispatch(modalCloseCreator({ modalKey: ModalKeysEnum.UPDATE_VERSION }));
  const openUpdateVersionModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.UPDATE_VERSION }));

  // Loading store
  const startLoadingReview = () =>
    dispatch(startLoadingActionCreator({ loadingKey: LoadingKeysEnum.REVIEW }));
  const stopLoadingReview = () =>
    dispatch(stopLoadingActionCreator({ loadingKey: LoadingKeysEnum.REVIEW }));
  const startLoadingLogin = () =>
    dispatch(startLoadingActionCreator({ loadingKey: LoadingKeysEnum.LOGIN }));
  const stopLoadingLogin = () =>
    dispatch(stopLoadingActionCreator({ loadingKey: LoadingKeysEnum.LOGIN }));

  // UserContext Store
  const skipReview = () => dispatch(skipReviewCreator());
  const sendAReview = () => dispatch(sendAReviewCreator());
  const finishOnboarding = () => dispatch(finishOnboardingCreator());
  const getEnvironment = (serverState: ServerState | undefined) => {
    if (!serverState) return;

    dispatch(
      getEnvironmentCreator({
        env: serverState.env,
        warnings: serverState.warnings,
        configErrors: !!serverState.configErrors
          ? serverState.configErrors
          : {},
      })
    );
  };

  return {
    getEnvironment,
    finishOnboarding,
    openLoginModal,
    closeLoginModal,
    startLoadingLogin,
    stopLoadingLogin,
    stopLoadingReview,
    startLoadingReview,
    sendAReview,
    skipReview,
    closeUpdateVersionModal,
    openUpdateVersionModal,
  };
};

export default useSliceMachineActions;
