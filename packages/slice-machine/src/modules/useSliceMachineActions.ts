import { useDispatch } from "react-redux";
import { LoadingKeysEnum } from "./loading/types";
import { ModalKeysEnum } from "./modal/types";
import { modalCloseCreator, modalOpenCreator } from "./modal";
import { startLoadingActionCreator, stopLoadingActionCreator } from "./loading";
import {
  sendAReviewCreator,
  skipReviewCreator,
  updatesViewedCreator,
  hasSeenTutorialsToolTipCreator,
  hasSeenSimulatorToolTipCreator,
  hasSeenChangesToolTipCreator,
} from "./userContext";
import { getChangelogCreator, refreshStateCreator } from "./environment";
import {
  checkSimulatorSetupCreator,
  connectToSimulatorIframeCreator,
} from "./simulator";
import ServerState from "@models/server/ServerState";
import {
  createCustomTypeCreator,
  deleteCustomTypeCreator,
  renameAvailableCustomType,
  saveCustomTypeCreator,
} from "./availableCustomTypes";
import {
  createSlice,
  deleteSliceCreator,
  generateSliceCustomScreenshotCreator,
  renameSliceCreator,
  updateSliceCreator,
} from "./slices";
import { UserContextStoreType, UserReviewType } from "./userContext/types";
import { GenericToastTypes, openToasterCreator } from "./toaster";
import { CustomTypes } from "@lib/models/common/CustomType";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { ComponentUI, ScreenshotUI } from "../../lib/models/common/ComponentUI";
import { ChangesPushSagaPayload, changesPushCreator } from "./pushChangesSaga";
import { saveSliceMockCreator } from "./simulator";
import { SaveSliceMockRequest } from "@src/apiClient";
import { CustomTypeFormat } from "@slicemachine/manager";
import { LibraryUI } from "@lib/models/common/LibraryUI";

const useSliceMachineActions = () => {
  const dispatch = useDispatch();

  const checkSimulatorSetup = (callback?: () => void) =>
    dispatch(checkSimulatorSetupCreator.request({ callback }));

  const connectToSimulatorIframe = () =>
    dispatch(connectToSimulatorIframeCreator.request());
  const connectToSimulatorFailure = () =>
    dispatch(connectToSimulatorIframeCreator.failure());
  const connectToSimulatorSuccess = () =>
    dispatch(connectToSimulatorIframeCreator.success());

  // Modal module
  const closeModals = () => {
    dispatch(modalCloseCreator());
  };
  const openLoginModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }));
  const openScreenshotsModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.SCREENSHOTS }));
  const openRenameSliceModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.RENAME_SLICE }));
  const openCreateCustomTypeModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.CREATE_CUSTOM_TYPE }));
  const openScreenshotPreviewModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.SCREENSHOT_PREVIEW }));
  const openDeleteSliceModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.DELETE_SLICE }));
  const openDeleteDocumentsDrawer = () =>
    dispatch(
      modalOpenCreator({
        modalKey: ModalKeysEnum.SOFT_DELETE_DOCUMENTS_DRAWER,
      }),
    );
  const openDeleteDocumentsDrawerOverLimit = () =>
    dispatch(
      modalOpenCreator({
        modalKey: ModalKeysEnum.HARD_DELETE_DOCUMENTS_DRAWER,
      }),
    );
  const openSimulatorSetupModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.SIMULATOR_SETUP }));

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
  const skipReview = (reviewType: UserReviewType) =>
    dispatch(
      skipReviewCreator({
        reviewType,
      }),
    );
  const sendAReview = (reviewType: UserReviewType) =>
    dispatch(
      sendAReviewCreator({
        reviewType,
      }),
    );
  const setUpdatesViewed = (versions: UserContextStoreType["updatesViewed"]) =>
    dispatch(updatesViewedCreator(versions));
  const setSeenSimulatorToolTip = () =>
    dispatch(hasSeenSimulatorToolTipCreator());
  const setSeenTutorialsToolTip = () =>
    dispatch(hasSeenTutorialsToolTipCreator());
  const setSeenChangesToolTip = () => dispatch(hasSeenChangesToolTipCreator());

  // Custom types module
  const createCustomType = (
    id: string,
    label: string,
    repeatable: boolean,
    format: CustomTypeFormat,
  ) =>
    dispatch(
      createCustomTypeCreator.request({ id, label, repeatable, format }),
    );

  /**
   * Success actions = sync store state from external actions. If its name
   * contains "Creator", it means it is still used in a saga and that `.request`
   * and `.failure` need to be preserved
   */
  const saveCustomTypeSuccess = (customType: CustomType) =>
    dispatch(
      saveCustomTypeCreator.success({
        customType: CustomTypes.toSM(customType),
      }),
    );

  const deleteCustomTypeSuccess = (id: string) =>
    dispatch(
      deleteCustomTypeCreator.success({
        customTypeId: id,
      }),
    );

  const renameAvailableCustomTypeSuccess = (customType: CustomType) =>
    dispatch(
      renameAvailableCustomType({
        renamedCustomType: CustomTypes.toSM(customType),
      }),
    );

  /** End of sucess actions */

  // Slice module
  const saveSliceSuccess = (component: ComponentUI) => {
    dispatch(
      updateSliceCreator.success({
        component,
      }),
    );
  };

  const saveSliceCustomScreenshotSuccess = (
    variationId: string,
    screenshot: ScreenshotUI,
    component: ComponentUI,
  ) => {
    dispatch(
      generateSliceCustomScreenshotCreator.success({
        variationId,
        screenshot,
        component,
      }),
    );
  };

  const createSliceSuccess = (libraries: readonly LibraryUI[]) =>
    dispatch(createSlice({ libraries }));

  const renameSlice = (
    libName: string,
    sliceId: string,
    newSliceName: string,
  ) =>
    dispatch(
      renameSliceCreator.request({
        sliceId,
        newSliceName,
        libName,
      }),
    );

  const deleteSlice = (sliceId: string, sliceName: string, libName: string) =>
    dispatch(
      deleteSliceCreator.request({
        sliceId,
        sliceName,
        libName,
      }),
    );

  const pushChanges = (payload: ChangesPushSagaPayload) =>
    dispatch(changesPushCreator.request(payload));

  // Toaster store
  const openToaster = (
    content: string | React.ReactNode,
    type: GenericToastTypes,
  ) => dispatch(openToasterCreator({ content, type }));

  // Simulator
  const saveSliceMock = (payload: SaveSliceMockRequest) =>
    dispatch(saveSliceMockCreator.request(payload));

  // State Action (used by multiple stores)
  const refreshState = (serverState: ServerState) => {
    dispatch(
      refreshStateCreator({
        env: serverState.env,
        remoteCustomTypes: serverState.remoteCustomTypes,
        localCustomTypes: serverState.customTypes,
        libraries: serverState.libraries,
        remoteSlices: serverState.remoteSlices,
        clientError: serverState.clientError,
      }),
    );
  };

  const getChangelog = () => {
    dispatch(getChangelogCreator.request());
  };

  return {
    checkSimulatorSetup,
    connectToSimulatorFailure,
    connectToSimulatorSuccess,
    openDeleteDocumentsDrawer,
    openDeleteDocumentsDrawerOverLimit,
    connectToSimulatorIframe,
    refreshState,
    openScreenshotsModal,
    openLoginModal,
    startLoadingLogin,
    stopLoadingLogin,
    stopLoadingReview,
    startLoadingReview,
    createCustomType,
    deleteCustomTypeSuccess,
    renameAvailableCustomTypeSuccess,
    saveCustomTypeSuccess,
    saveSliceSuccess,
    saveSliceCustomScreenshotSuccess,
    createSliceSuccess,
    renameSlice,
    deleteSlice,
    sendAReview,
    skipReview,
    setUpdatesViewed,
    setSeenTutorialsToolTip,
    setSeenSimulatorToolTip,
    setSeenChangesToolTip,
    openCreateCustomTypeModal,
    openScreenshotPreviewModal,
    openDeleteSliceModal,
    openSimulatorSetupModal,
    openRenameSliceModal,
    closeModals,
    openToaster,
    pushChanges,
    saveSliceMock,
    getChangelog,
  };
};

export default useSliceMachineActions;
