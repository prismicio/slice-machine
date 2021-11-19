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
import {
  createCustomTypesCreator,
  getCustomTypesCreator,
  saveCustomTypesCreator,
} from "@src/modules/customTypes";
import { CustomType, ObjectTabs } from "@models/common/CustomType";
import { CustomTypeState } from "@models/ui/CustomTypeState";

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

  // Environment store
  const getEnvironment = (serverState: ServerState) => {
    dispatch(
      getEnvironmentCreator({
        env: serverState.env,
        warnings: serverState.warnings,
        configErrors: serverState.configErrors,
      })
    );
  };

  // CustomTypes store
  const getCustomTypes = (
    localCustomTypes: Partial<ReadonlyArray<CustomType<ObjectTabs>>>,
    remoteCustomTypes: Partial<ReadonlyArray<CustomType<ObjectTabs>>>
  ) => {
    dispatch(getCustomTypesCreator({ localCustomTypes, remoteCustomTypes }));
  };
  const saveCustomType = (modelPayload: CustomTypeState) => {
    dispatch(saveCustomTypesCreator({ modelPayload }));
  };
  const createCustomType = (id: string, label: string, repeatable: boolean) => {
    dispatch(createCustomTypesCreator({ id, label, repeatable }));
  };

  return {
    getCustomTypes,
    saveCustomType,
    createCustomType,
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
