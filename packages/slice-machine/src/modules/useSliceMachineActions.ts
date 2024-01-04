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
import { createSlice, deleteSliceCreator, renameSliceCreator } from "./slices";
import { UserContextStoreType, UserReviewType } from "./userContext/types";
import { GenericToastTypes, openToasterCreator } from "./toaster";
import type { SliceBuilderState } from "@builders/SliceBuilder";
import { CustomTypes } from "@lib/models/common/CustomType";
import {
  CustomType,
  NestableWidget,
} from "@prismicio/types-internal/lib/customtypes";
import {
  addSliceWidgetCreator,
  copyVariationSliceCreator,
  deleteSliceWidgetMockCreator,
  initSliceStoreCreator,
  removeSliceWidgetCreator,
  reorderSliceWidgetCreator,
  replaceSliceWidgetCreator,
  updateAndSaveSliceCreator,
  updateSliceCreator,
  updateSliceWidgetMockCreator,
} from "./selectedSlice/actions";
import { generateSliceCustomScreenshotCreator } from "./screenshots/actions";
import { ComponentUI } from "../../lib/models/common/ComponentUI";
import { ChangesPushSagaPayload, changesPushCreator } from "./pushChangesSaga";
import type { ScreenshotGenerationMethod } from "@lib/models/common/Screenshots";
import { saveSliceMockCreator } from "./simulator";
import { SaveSliceMockRequest } from "@src/apiClient";
import { VariationSM, WidgetsArea } from "@lib/models/common/Slice";
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
  const initSliceStore = (component: ComponentUI) =>
    dispatch(initSliceStoreCreator(component));

  const addSliceWidget = (
    variationId: string,
    widgetsArea: WidgetsArea,
    key: string,
    value: NestableWidget,
  ) => {
    dispatch(addSliceWidgetCreator({ variationId, widgetsArea, key, value }));
  };

  const replaceSliceWidget = (
    variationId: string,
    widgetsArea: WidgetsArea,
    previousKey: string,
    newKey: string,
    value: NestableWidget,
  ) => {
    dispatch(
      replaceSliceWidgetCreator({
        variationId,
        widgetsArea,
        previousKey,
        newKey,
        value,
      }),
    );
  };

  const reorderSliceWidget = (
    variationId: string,
    widgetsArea: WidgetsArea,
    start: number,
    end: number | undefined,
  ) => {
    dispatch(
      reorderSliceWidgetCreator({
        variationId,
        widgetsArea,
        start,
        end,
      }),
    );
  };

  const removeSliceWidget = (
    variationId: string,
    widgetsArea: WidgetsArea,
    key: string,
  ) => {
    dispatch(
      removeSliceWidgetCreator({
        variationId,
        widgetsArea,
        key,
      }),
    );
  };

  const deleteSliceWidgetMock = (
    variationId: string,
    widgetArea: WidgetsArea,
    newKey: string,
  ) => {
    dispatch(
      deleteSliceWidgetMockCreator({
        variationId,
        widgetArea,
        newKey,
      }),
    );
  };

  const updateSliceWidgetMock = (
    variationId: string,
    widgetArea: WidgetsArea,
    previousKey: string,
    newKey: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockValue: any,
  ) => {
    dispatch(
      updateSliceWidgetMockCreator({
        variationId,
        widgetArea,
        previousKey,
        newKey,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        mockValue,
      }),
    );
  };

  const generateSliceCustomScreenshot = (
    variationId: string,
    component: ComponentUI,
    file: Blob,
    method: ScreenshotGenerationMethod,
  ) => {
    dispatch(
      generateSliceCustomScreenshotCreator.request({
        variationId,
        component,
        file,
        method,
      }),
    );
  };

  const updateSlice = (
    component: ComponentUI,
    setSliceBuilderState: (sliceBuilderState: SliceBuilderState) => void,
  ) => {
    dispatch(
      updateSliceCreator.request({
        component,
        setSliceBuilderState,
      }),
    );
  };

  const updateAndSaveSlice = (component: ComponentUI) => {
    dispatch(updateAndSaveSliceCreator({ component }));
  };

  const copyVariationSlice = (
    key: string,
    name: string,
    copied: VariationSM,
  ) => {
    dispatch(copyVariationSliceCreator({ key, name, copied }));
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
    initSliceStore,
    addSliceWidget,
    replaceSliceWidget,
    reorderSliceWidget,
    removeSliceWidget,
    updateSliceWidgetMock,
    deleteSliceWidgetMock,
    generateSliceCustomScreenshot,
    updateSlice,
    updateAndSaveSlice,
    copyVariationSlice,
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
