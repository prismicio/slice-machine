import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { useDispatch } from "react-redux";

import { SaveSliceMockRequest } from "@/apiClient";
import {
  ComponentUI,
  ScreenshotUI,
} from "@/legacy/lib/models/common/ComponentUI";
import { CustomTypes } from "@/legacy/lib/models/common/CustomType";
import { LibraryUI } from "@/legacy/lib/models/common/LibraryUI";
import { SliceSM } from "@/legacy/lib/models/common/Slice";
import ServerState from "@/legacy/lib/models/server/ServerState";

import {
  customTypeCreateSuccess,
  customTypeDeleteSuccess,
  customTypeRenameSuccess,
  customTypeSaveSuccess,
} from "./availableCustomTypes";
import { refreshStateCreator } from "./environment";
import { startLoadingActionCreator, stopLoadingActionCreator } from "./loading";
import { LoadingKeysEnum } from "./loading/types";
import { modalCloseCreator, modalOpenCreator } from "./modal";
import { ModalKeysEnum } from "./modal/types";
import {
  sliceCreateSuccess,
  sliceDeleteSuccess,
  sliceGenerateCustomScreenshotSuccess,
  sliceRenameSuccess,
  sliceUpdateMockSuccess,
  sliceUpdateSuccess,
} from "./slices";
import {
  changesPushSuccess,
  hasSeenChangesToolTipCreator,
  hasSeenSimulatorToolTipCreator,
  hasSeenTutorialsToolTipCreator,
  sendAReviewCreator,
  skipReviewCreator,
} from "./userContext";
import { UserReviewType } from "./userContext/types";

const useSliceMachineActions = () => {
  const dispatch = useDispatch();

  // Modal module
  const closeModals = () => {
    dispatch(modalCloseCreator());
  };
  const openLoginModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }));
  const openScreenshotsModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.SCREENSHOTS }));
  const openScreenshotPreviewModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.SCREENSHOT_PREVIEW }));

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
  const setSeenSimulatorToolTip = () =>
    dispatch(hasSeenSimulatorToolTipCreator());
  const setSeenTutorialsToolTip = () =>
    dispatch(hasSeenTutorialsToolTipCreator());
  const setSeenChangesToolTip = () => dispatch(hasSeenChangesToolTipCreator());

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

  /**
   * Success actions = sync store state from external actions.
   */

  /**
   * Custom Type module
   */
  const createCustomTypeSuccess = (newCustomType: CustomType) =>
    dispatch(
      customTypeCreateSuccess({
        newCustomType: CustomTypes.toSM(newCustomType),
      }),
    );
  const saveCustomTypeSuccess = (customType: CustomType) =>
    dispatch(
      customTypeSaveSuccess({
        newCustomType: CustomTypes.toSM(customType),
      }),
    );
  const deleteCustomTypeSuccess = (id: string) =>
    dispatch(
      customTypeDeleteSuccess({
        customTypeId: id,
      }),
    );
  const renameCustomTypeSuccess = (customType: CustomType) =>
    dispatch(
      customTypeRenameSuccess({
        renamedCustomType: CustomTypes.toSM(customType),
      }),
    );

  /**
   * Slice module
   */
  const saveSliceSuccess = (component: ComponentUI) => {
    dispatch(
      sliceUpdateSuccess({
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
      sliceGenerateCustomScreenshotSuccess({
        variationId,
        screenshot,
        component,
      }),
    );
  };
  const createSliceSuccess = (libraries: readonly LibraryUI[]) =>
    dispatch(sliceCreateSuccess({ libraries }));
  const deleteSliceSuccess = (sliceId: string, libName: string) =>
    dispatch(
      sliceDeleteSuccess({
        sliceId,
        libName,
      }),
    );
  const renameSliceSuccess = (libName: string, renamedSlice: SliceSM) =>
    dispatch(
      sliceRenameSuccess({
        renamedSlice,
        libName,
      }),
    );
  const updateSliceMockSuccess = (args: SaveSliceMockRequest) =>
    dispatch(sliceUpdateMockSuccess(args));

  /**
   * Changes module
   */
  const pushChangesSuccess = () => dispatch(changesPushSuccess());

  return {
    refreshState,
    openScreenshotsModal,
    openLoginModal,
    startLoadingLogin,
    stopLoadingLogin,
    stopLoadingReview,
    startLoadingReview,
    deleteCustomTypeSuccess,
    renameCustomTypeSuccess,
    saveCustomTypeSuccess,
    saveSliceSuccess,
    saveSliceCustomScreenshotSuccess,
    createSliceSuccess,
    renameSliceSuccess,
    deleteSliceSuccess,
    sendAReview,
    skipReview,
    setSeenTutorialsToolTip,
    setSeenSimulatorToolTip,
    setSeenChangesToolTip,
    openScreenshotPreviewModal,
    closeModals,
    pushChangesSuccess,
    createCustomTypeSuccess,
    updateSliceMockSuccess,
  };
};

export default useSliceMachineActions;
