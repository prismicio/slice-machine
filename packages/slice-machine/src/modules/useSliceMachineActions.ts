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
  updatesViewedCreator,
  viewedVideosToolTipCreator,
} from "@src/modules/userContext";
import { refreshStateCreator } from "@src/modules/environment";
import {
  openSetupDrawerCreator,
  closeSetupDrawerCreator,
  toggleSetupDrawerStepCreator,
  checkSimulatorSetupCreator,
  connectToSimulatorIframeCreator,
} from "@src/modules/simulator";
import ServerState from "@models/server/ServerState";
import {
  createCustomTypeCreator,
  saveCustomTypeCreator,
} from "@src/modules/customTypes";
import { CustomTypeState } from "@models/ui/CustomTypeState";
import { createSliceCreator } from "@src/modules/slices";
import { UserContextStoreType } from "./userContext/types";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";

const useSliceMachineActions = () => {
  const dispatch = useDispatch();

  // Simulator module
  const checkSimulatorSetup = (
    withFirstVisitCheck: boolean,
    callback?: () => void
  ) =>
    dispatch(
      checkSimulatorSetupCreator.request({ withFirstVisitCheck, callback })
    );
  const openSetupDrawer = () => dispatch(openSetupDrawerCreator({}));
  const closeSetupDrawer = () => dispatch(closeSetupDrawerCreator());
  const connectToSimulatorFailure = () =>
    dispatch(connectToSimulatorIframeCreator.failure());
  const connectToSimulatorSuccess = () =>
    dispatch(connectToSimulatorIframeCreator.success());
  const toggleSetupDrawerStep = (stepNumber: number) =>
    dispatch(toggleSetupDrawerStepCreator({ stepNumber }));

  // Modal module
  const closeLoginModal = () =>
    dispatch(modalCloseCreator({ modalKey: ModalKeysEnum.LOGIN }));
  const openLoginModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }));
  const closeCreateSliceModal = () =>
    dispatch(modalCloseCreator({ modalKey: ModalKeysEnum.CREATE_SLICE }));
  const openCreateSliceModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.CREATE_SLICE }));
  const closeCreateCustomTypeModal = () =>
    dispatch(modalCloseCreator({ modalKey: ModalKeysEnum.CREATE_CUSTOM_TYPE }));
  const openCreateCustomTypeModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.CREATE_CUSTOM_TYPE }));

  // Loading module
  const startLoadingReview = () =>
    dispatch(startLoadingActionCreator({ loadingKey: LoadingKeysEnum.REVIEW }));
  const stopLoadingReview = () =>
    dispatch(stopLoadingActionCreator({ loadingKey: LoadingKeysEnum.REVIEW }));
  const startLoadingLogin = () =>
    dispatch(startLoadingActionCreator({ loadingKey: LoadingKeysEnum.LOGIN }));
  const stopLoadingLogin = () =>
    dispatch(stopLoadingActionCreator({ loadingKey: LoadingKeysEnum.LOGIN }));

  // UserContext module
  const skipReview = () => dispatch(skipReviewCreator());
  const sendAReview = () => dispatch(sendAReviewCreator());
  const finishOnboarding = () => dispatch(finishOnboardingCreator());
  const setUpdatesViewed = (versions: UserContextStoreType["updatesViewed"]) =>
    dispatch(updatesViewedCreator(versions));
  const setVideosViewedToolTip = () => dispatch(viewedVideosToolTipCreator());

  // Custom types module
  const createCustomType = (id: string, label: string, repeatable: boolean) =>
    dispatch(createCustomTypeCreator.request({ id, label, repeatable }));
  const saveCustomType = (modelPayload: CustomTypeState) =>
    dispatch(saveCustomTypeCreator({ modelPayload }));

  // Slice module
  const createSlice = (sliceName: string, libName: string) =>
    dispatch(createSliceCreator.request({ sliceName, libName }));

  // Toaster store
  const openToaster = (message: string, type: ToasterType) =>
    dispatch(openToasterCreator({ message, type }));

  // State Action (used by multiple stores)
  const refreshState = (serverState: ServerState) => {
    dispatch(
      refreshStateCreator({
        env: serverState.env,
        warnings: serverState.warnings,
        configErrors: serverState.configErrors,
        remoteCustomTypes: serverState.remoteCustomTypes,
        localCustomTypes: serverState.customTypes,
        libraries: serverState.libraries,
        remoteSlices: serverState.remoteSlices,
      })
    );
  };

  return {
    checkSimulatorSetup,
    connectToSimulatorFailure,
    connectToSimulatorSuccess,
    toggleSetupDrawerStep,
    closeSetupDrawer,
    openSetupDrawer,
    refreshState,
    finishOnboarding,
    openLoginModal,
    closeLoginModal,
    startLoadingLogin,
    stopLoadingLogin,
    stopLoadingReview,
    startLoadingReview,
    createCustomType,
    saveCustomType,
    createSlice,
    sendAReview,
    skipReview,
    setUpdatesViewed,
    setVideosViewedToolTip,
    closeCreateCustomTypeModal,
    openCreateCustomTypeModal,
    openCreateSliceModal,
    closeCreateSliceModal,
    openToaster,
  };
};

export default useSliceMachineActions;
