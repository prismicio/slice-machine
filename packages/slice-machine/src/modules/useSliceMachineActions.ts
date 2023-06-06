import { useDispatch } from "react-redux";
import { LoadingKeysEnum } from "./loading/types";
import { ModalKeysEnum } from "./modal/types";
import { modalCloseCreator, modalOpenCreator } from "./modal";
import { startLoadingActionCreator, stopLoadingActionCreator } from "./loading";
import {
  sendAReviewCreator,
  skipReviewCreator,
  updatesViewedCreator,
  hasSeenTutorialsTooTipCreator,
  hasSeenSimulatorToolTipCreator,
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
  renameCustomTypeCreator,
} from "./availableCustomTypes";
import {
  createSliceCreator,
  deleteSliceCreator,
  renameSliceCreator,
} from "./slices";
import { UserContextStoreType } from "./userContext/types";
import { GenericToastTypes, openToasterCreator } from "./toaster";
import {
  initCustomTypeStoreCreator,
  createTabCreator,
  deleteTabCreator,
  updateTabCreator,
  addFieldCreator,
  deleteFieldCreator,
  reorderFieldCreator,
  replaceFieldCreator,
  deleteSharedSliceCreator,
  replaceSharedSliceCreator,
  createSliceZoneCreator,
  deleteSliceZoneCreator,
  saveCustomTypeCreator,
  addFieldIntoGroupCreator,
  deleteFieldIntoGroupCreator,
  reorderFieldIntoGroupCreator,
  replaceFieldIntoGroupCreator,
  cleanupCustomTypeStoreCreator,
} from "./selectedCustomType";
import { CustomTypeSM, TabField } from "@lib/models/common/CustomType";
import { NestableWidget } from "@prismicio/types-internal/lib/customtypes";
import {
  addSliceWidgetCreator,
  copyVariationSliceCreator,
  deleteSliceWidgetMockCreator,
  initSliceStoreCreator,
  removeSliceWidgetCreator,
  reorderSliceWidgetCreator,
  replaceSliceWidgetCreator,
  updateSliceCreator,
  updateSliceWidgetMockCreator,
} from "./selectedSlice/actions";
import {
  generateSliceCustomScreenshotCreator,
  generateSliceScreenshotCreator,
} from "./screenshots/actions";
import { ComponentUI } from "../../lib/models/common/ComponentUI";
import { ChangesPushSagaPayload, changesPushCreator } from "./pushChangesSaga";
import type {
  ScreenDimensions,
  ScreenshotGenerationMethod,
} from "@lib/models/common/Screenshots";
import { saveSliceMockCreator } from "./simulator";
import { SaveSliceMockRequest } from "@src/apiClient";
import { VariationSM, WidgetsArea } from "@lib/models/common/Slice";
import { CustomTypeFormat } from "@slicemachine/manager";

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
  const openCreateSliceModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.CREATE_SLICE }));
  const openRenameSliceModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.RENAME_SLICE }));
  const openCreateCustomTypeModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.CREATE_CUSTOM_TYPE }));
  const openRenameCustomTypeModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.RENAME_CUSTOM_TYPE }));
  const openScreenshotPreviewModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.SCREENSHOT_PREVIEW }));

  const openDeleteCustomTypeModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.DELETE_CUSTOM_TYPE }));
  const openDeleteSliceModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.DELETE_SLICE }));
  const openDeleteDocumentsDrawer = () =>
    dispatch(
      modalOpenCreator({ modalKey: ModalKeysEnum.SOFT_DELETE_DOCUMENTS_DRAWER })
    );
  const openDeleteDocumentsDrawerOverLimit = () =>
    dispatch(
      modalOpenCreator({
        modalKey: ModalKeysEnum.HARD_DELETE_DOCUMENTS_DRAWER,
      })
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
  const skipReview = () => dispatch(skipReviewCreator());
  const sendAReview = () => dispatch(sendAReviewCreator());
  const setUpdatesViewed = (versions: UserContextStoreType["updatesViewed"]) =>
    dispatch(updatesViewedCreator(versions));
  const setSeenSimulatorToolTip = () =>
    dispatch(hasSeenSimulatorToolTipCreator());
  const setSeenTutorialsToolTip = () =>
    dispatch(hasSeenTutorialsTooTipCreator());

  // Custom types module
  const createCustomType = (
    id: string,
    label: string,
    repeatable: boolean,
    format: CustomTypeFormat
  ) =>
    dispatch(
      createCustomTypeCreator.request({ id, label, repeatable, format })
    );
  const renameCustomType = (
    customTypeId: string,
    format: CustomTypeFormat,
    newCustomTypeName: string
  ) =>
    dispatch(
      renameCustomTypeCreator.request({
        customTypeId,
        format,
        newCustomTypeName,
      })
    );
  const deleteCustomType = (
    customTypeId: string,
    format: CustomTypeFormat,
    customTypeName: string
  ) =>
    dispatch(
      deleteCustomTypeCreator.request({
        customTypeId,
        format,
        customTypeName,
      })
    );

  // Custom type module
  const initCustomTypeStore = (
    model: CustomTypeSM,
    remoteModel: CustomTypeSM | undefined,
  ) => dispatch(initCustomTypeStoreCreator({ model, remoteModel }));
  const cleanupCustomTypeStore = () =>
    dispatch(cleanupCustomTypeStoreCreator());
  const saveCustomType = () => dispatch(saveCustomTypeCreator.request());
  const createCustomTypeTab = (tabId: string) =>
    dispatch(createTabCreator({ tabId }));
  const deleteCustomTypeTab = (tabId: string) =>
    dispatch(deleteTabCreator({ tabId }));
  const updateCustomTypeTab = (tabId: string, newTabId: string) =>
    dispatch(updateTabCreator({ tabId, newTabId }));
  const addCustomTypeField = (
    tabId: string,
    fieldId: string,
    field: TabField
  ) => dispatch(addFieldCreator({ tabId, fieldId, field }));
  const deleteCustomTypeField = (tabId: string, fieldId: string) =>
    dispatch(deleteFieldCreator({ tabId, fieldId }));
  const reorderCustomTypeField = (tabId: string, start: number, end: number) =>
    dispatch(reorderFieldCreator({ tabId, start, end }));
  const replaceCustomTypeField = (
    tabId: string,
    previousFieldId: string,
    newFieldId: string,
    value: TabField
  ) =>
    dispatch(
      replaceFieldCreator({ tabId, previousFieldId, newFieldId, value })
    );
  const createSliceZone = (tabId: string) =>
    dispatch(createSliceZoneCreator({ tabId }));
  const deleteSliceZone = (tabId: string) =>
    dispatch(deleteSliceZoneCreator({ tabId }));
  const deleteCustomTypeSharedSlice = (tabId: string, sliceId: string) =>
    dispatch(deleteSharedSliceCreator({ tabId, sliceId }));
  const replaceCustomTypeSharedSlice = (
    tabId: string,
    sliceKeys: string[],
    preserve: string[]
  ) => dispatch(replaceSharedSliceCreator({ tabId, sliceKeys, preserve }));
  const addFieldIntoGroup = (
    tabId: string,
    groupId: string,
    fieldId: string,
    field: NestableWidget
  ) => dispatch(addFieldIntoGroupCreator({ tabId, groupId, fieldId, field }));
  const deleteFieldIntoGroup = (
    tabId: string,
    groupId: string,
    fieldId: string
  ) => dispatch(deleteFieldIntoGroupCreator({ tabId, groupId, fieldId }));
  const reorderFieldIntoGroup = (
    tabId: string,
    groupId: string,
    start: number,
    end: number
  ) => dispatch(reorderFieldIntoGroupCreator({ tabId, groupId, start, end }));
  const replaceFieldIntoGroup = (
    tabId: string,
    groupId: string,
    previousFieldId: string,
    newFieldId: string,
    value: NestableWidget
  ) =>
    dispatch(
      replaceFieldIntoGroupCreator({
        tabId,
        groupId,
        previousFieldId,
        newFieldId,
        value,
      })
    );

  // Slice module
  const initSliceStore = (component: ComponentUI) =>
    dispatch(initSliceStoreCreator(component));

  const addSliceWidget = (
    variationId: string,
    widgetsArea: WidgetsArea,
    key: string,
    value: NestableWidget
  ) => {
    dispatch(addSliceWidgetCreator({ variationId, widgetsArea, key, value }));
  };

  const replaceSliceWidget = (
    variationId: string,
    widgetsArea: WidgetsArea,
    previousKey: string,
    newKey: string,
    value: NestableWidget
  ) => {
    dispatch(
      replaceSliceWidgetCreator({
        variationId,
        widgetsArea,
        previousKey,
        newKey,
        value,
      })
    );
  };

  const reorderSliceWidget = (
    variationId: string,
    widgetsArea: WidgetsArea,
    start: number,
    end: number | undefined
  ) => {
    dispatch(
      reorderSliceWidgetCreator({
        variationId,
        widgetsArea,
        start,
        end,
      })
    );
  };

  const removeSliceWidget = (
    variationId: string,
    widgetsArea: WidgetsArea,
    key: string
  ) => {
    dispatch(
      removeSliceWidgetCreator({
        variationId,
        widgetsArea,
        key,
      })
    );
  };

  const deleteSliceWidgetMock = (
    variationId: string,
    widgetArea: WidgetsArea,
    newKey: string
  ) => {
    dispatch(
      deleteSliceWidgetMockCreator({
        variationId,
        widgetArea,
        newKey,
      })
    );
  };

  const updateSliceWidgetMock = (
    variationId: string,
    widgetArea: WidgetsArea,
    previousKey: string,
    newKey: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockValue: any
  ) => {
    dispatch(
      updateSliceWidgetMockCreator({
        variationId,
        widgetArea,
        previousKey,
        newKey,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        mockValue,
      })
    );
  };

  const generateSliceScreenshot = (
    variationId: string,
    component: ComponentUI,
    screenDimensions: ScreenDimensions,
    method: ScreenshotGenerationMethod
  ) => {
    dispatch(
      generateSliceScreenshotCreator.request({
        variationId,
        component,
        screenDimensions,
        method,
      })
    );
  };

  const generateSliceCustomScreenshot = (
    variationId: string,
    component: ComponentUI,
    file: Blob,
    method: ScreenshotGenerationMethod
  ) => {
    dispatch(
      generateSliceCustomScreenshotCreator.request({
        variationId,
        component,
        file,
        method,
      })
    );
  };

  const updateSlice = (
    component: ComponentUI,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setData: (data: any) => void
  ) => {
    dispatch(
      updateSliceCreator.request({
        component,
        setData,
      })
    );
  };

  const copyVariationSlice = (
    key: string,
    name: string,
    copied: VariationSM
  ) => {
    dispatch(copyVariationSliceCreator({ key, name, copied }));
  };

  const createSlice = (sliceName: string, libName: string) =>
    dispatch(createSliceCreator.request({ sliceName, libName }));

  const renameSlice = (
    libName: string,
    sliceId: string,
    newSliceName: string
  ) =>
    dispatch(
      renameSliceCreator.request({
        sliceId,
        newSliceName,
        libName,
      })
    );

  const deleteSlice = (sliceId: string, sliceName: string, libName: string) =>
    dispatch(
      deleteSliceCreator.request({
        sliceId,
        sliceName,
        libName,
      })
    );

  const pushChanges = (payload: ChangesPushSagaPayload) =>
    dispatch(changesPushCreator.request(payload));

  // Toaster store
  const openToaster = (
    content: string | React.ReactNode,
    type: GenericToastTypes
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
      })
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
    renameCustomType,
    deleteCustomType,
    initCustomTypeStore,
    cleanupCustomTypeStore,
    saveCustomType,
    createCustomTypeTab,
    updateCustomTypeTab,
    deleteCustomTypeTab,
    addCustomTypeField,
    deleteCustomTypeField,
    reorderCustomTypeField,
    replaceCustomTypeField,
    createSliceZone,
    deleteSliceZone,
    deleteCustomTypeSharedSlice,
    replaceCustomTypeSharedSlice,

    addFieldIntoGroup,
    deleteFieldIntoGroup,
    reorderFieldIntoGroup,
    replaceFieldIntoGroup,
    initSliceStore,
    addSliceWidget,
    replaceSliceWidget,
    reorderSliceWidget,
    removeSliceWidget,
    updateSliceWidgetMock,
    deleteSliceWidgetMock,
    generateSliceScreenshot,
    generateSliceCustomScreenshot,
    updateSlice,
    copyVariationSlice,
    createSlice,
    renameSlice,
    deleteSlice,
    sendAReview,
    skipReview,
    setUpdatesViewed,
    setSeenTutorialsToolTip,
    setSeenSimulatorToolTip,
    openCreateCustomTypeModal,
    openRenameCustomTypeModal,
    openScreenshotPreviewModal,
    openDeleteCustomTypeModal,
    openDeleteSliceModal,
    openSimulatorSetupModal,
    openCreateSliceModal,
    openRenameSliceModal,
    closeModals,
    openToaster,
    pushChanges,
    saveSliceMock,
    getChangelog,
  };
};

export default useSliceMachineActions;
