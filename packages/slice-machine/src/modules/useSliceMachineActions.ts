import { useDispatch } from "react-redux";
import { LoadingKeysEnum } from "./loading/types";
import { ModalKeysEnum } from "./modal/types";
import { modalCloseCreator, modalOpenCreator } from "./modal";
import { startLoadingActionCreator, stopLoadingActionCreator } from "./loading";
import {
  finishOnboardingCreator,
  sendAReviewCreator,
  skipReviewCreator,
  updatesViewedCreator,
  hasSeenTutorialsTooTipCreator,
} from "./userContext";
import { refreshStateCreator } from "./environment";
import {
  checkSimulatorSetupCreator,
  connectToSimulatorIframeCreator,
} from "./simulator";
import ServerState from "@models/server/ServerState";
import {
  createCustomTypeCreator,
  renameCustomTypeCreator,
} from "./availableCustomTypes";
import { createSliceCreator, renameSliceCreator } from "./slices";
import { UserContextStoreType } from "./userContext/types";
import { openToasterCreator, ToasterType } from "./toaster";
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
  saveCustomTypeCreator,
  addFieldIntoGroupCreator,
  deleteFieldIntoGroupCreator,
  reorderFieldIntoGroupCreator,
  replaceFieldIntoGroupCreator,
  updateGroupFieldMockConfigCreator,
  deleteGroupFieldMockConfigCreator,
  deleteFieldMockConfigCreator,
  updateFieldMockConfigCreator,
} from "./selectedCustomType";
import { CustomTypeMockConfig } from "@models/common/MockConfig";
import {
  CustomTypeSM,
  TabField,
} from "@slicemachine/core/build/models/CustomType";
import { NestableWidget } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import {
  addSliceWidgetCreator,
  copyVariationSliceCreator,
  deleteSliceWidgetMockCreator,
  initSliceStoreCreator,
  removeSliceWidgetCreator,
  reorderSliceWidgetCreator,
  replaceSliceWidgetCreator,
  saveSliceCreator,
  updateSliceWidgetMockCreator,
} from "./selectedSlice/actions";
import {
  generateSliceCustomScreenshotCreator,
  generateSliceScreenshotCreator,
} from "./screenshots/actions";
import {
  pushCustomTypeCreator,
  pushSliceCreator,
} from "./pushChangesSaga/actions";
import { Models } from "@slicemachine/core";
import { ComponentUI } from "../../lib/models/common/ComponentUI";
import { SliceBuilderState } from "../../lib/builders/SliceBuilder";
import { changesPushCreator } from "./pushChangesSaga";
import { SyncError } from "@src/models/SyncError";
import { ModelStatusInformation } from "@src/hooks/useModelStatus";
import { ScreenDimensions } from "@lib/models/common/Screenshots";
import { ScreenshotTaken } from "@src/tracking/types";

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
  const finishOnboarding = () => dispatch(finishOnboardingCreator());
  const setUpdatesViewed = (versions: UserContextStoreType["updatesViewed"]) =>
    dispatch(updatesViewedCreator(versions));
  const setSeenTutorialsToolTip = () =>
    dispatch(hasSeenTutorialsTooTipCreator());

  // Custom types module
  const createCustomType = (id: string, label: string, repeatable: boolean) =>
    dispatch(createCustomTypeCreator.request({ id, label, repeatable }));
  const renameCustomType = (customTypeId: string, newCustomTypeName: string) =>
    dispatch(
      renameCustomTypeCreator.request({
        customTypeId,
        newCustomTypeName,
      })
    );

  // Custom type module
  const initCustomTypeStore = (
    model: CustomTypeSM,
    remoteModel: CustomTypeSM | undefined,
    mockConfig: CustomTypeMockConfig
  ) => dispatch(initCustomTypeStoreCreator({ model, mockConfig, remoteModel }));
  const saveCustomType = () => dispatch(saveCustomTypeCreator.request());
  const pushCustomType = () => dispatch(pushCustomTypeCreator.request());
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
  const deleteCustomTypeSharedSlice = (tabId: string, sliceId: string) =>
    dispatch(deleteSharedSliceCreator({ tabId, sliceId }));
  const replaceCustomTypeSharedSlice = (
    tabId: string,
    sliceKeys: string[],
    preserve: string[]
  ) => dispatch(replaceSharedSliceCreator({ tabId, sliceKeys, preserve }));
  const updateFieldMockConfig = (
    customTypeMockConfig: CustomTypeMockConfig,
    previousFieldId: string,
    fieldId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) =>
    dispatch(
      updateFieldMockConfigCreator({
        customTypeMockConfig,
        previousFieldId,
        fieldId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        value,
      })
    );
  const deleteFieldMockConfig = (
    customTypeMockConfig: CustomTypeMockConfig,
    fieldId: string
  ) =>
    dispatch(deleteFieldMockConfigCreator({ customTypeMockConfig, fieldId }));
  const updateGroupFieldMockConfig = (
    customTypeMockConfig: CustomTypeMockConfig,
    groupId: string,
    previousFieldId: string,
    fieldId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) =>
    dispatch(
      updateGroupFieldMockConfigCreator({
        customTypeMockConfig,
        groupId,
        previousFieldId,
        fieldId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        value,
      })
    );
  const deleteGroupFieldMockConfig = (
    customTypeMockConfig: CustomTypeMockConfig,
    groupId: string,
    fieldId: string
  ) =>
    dispatch(
      deleteGroupFieldMockConfigCreator({
        customTypeMockConfig,
        groupId,
        fieldId,
      })
    );
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
    widgetsArea: Models.WidgetsArea,
    key: string,
    value: NestableWidget
  ) => {
    dispatch(addSliceWidgetCreator({ variationId, widgetsArea, key, value }));
  };

  const replaceSliceWidget = (
    variationId: string,
    widgetsArea: Models.WidgetsArea,
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
    widgetsArea: Models.WidgetsArea,
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
    widgetsArea: Models.WidgetsArea,
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

  const updateSliceWidgetMock = (
    variationId: string,
    mockConfig: CustomTypeMockConfig,
    widgetArea: Models.WidgetsArea,
    previousKey: string,
    newKey: string,
    mockValue: any
  ) => {
    dispatch(
      updateSliceWidgetMockCreator({
        variationId,
        mockConfig,
        widgetArea,
        previousKey,
        newKey,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        mockValue,
      })
    );
  };

  const deleteSliceWidgetMock = (
    variationId: string,
    mockConfig: CustomTypeMockConfig,
    widgetArea: Models.WidgetsArea,
    newKey: string
  ) => {
    dispatch(
      deleteSliceWidgetMockCreator({
        variationId,
        mockConfig,
        widgetArea,
        newKey,
      })
    );
  };

  const generateSliceScreenshot = (
    variationId: string,
    component: ComponentUI,
    screenDimensions: ScreenDimensions,
    method: ScreenshotTaken["props"]["method"]
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
    method: ScreenshotTaken["props"]["method"]
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

  const saveSlice = (component: ComponentUI, setData: (data: any) => void) => {
    dispatch(
      saveSliceCreator.request({
        component,
        setData,
      })
    );
  };

  const pushSlice = (
    component: ComponentUI,
    onPush: (data: SliceBuilderState) => void
  ) => {
    dispatch(
      pushSliceCreator.request({
        component,
        onPush,
      })
    );
  };

  const copyVariationSlice = (
    key: string,
    name: string,
    copied: Models.VariationSM
  ) => {
    dispatch(copyVariationSliceCreator({ key, name, copied }));
  };

  const createSlice = (sliceName: string, libName: string) =>
    dispatch(createSliceCreator.request({ sliceName, libName }));

  const renameSlice = (
    sliceId: string,
    newSliceName: string,
    libName: string,
    variationId: string
  ) =>
    dispatch(
      renameSliceCreator.request({
        sliceId,
        newSliceName,
        libName,
        variationId,
      })
    );

  const pushChanges = (
    unSyncedSlices: ReadonlyArray<ComponentUI>,
    unSyncedCustomTypes: ReadonlyArray<CustomTypeSM>,
    modelStatuses: ModelStatusInformation["modelsStatuses"],
    onChangesPushed: (pushed: string | null) => void,
    handleError: (e: SyncError | null) => void
  ) =>
    dispatch(
      changesPushCreator({
        unSyncedSlices,
        unSyncedCustomTypes,
        modelStatuses,
        onChangesPushed,
        handleError,
      })
    );

  // Toaster store
  const openToaster = (
    message: string,
    type: Exclude<ToasterType, ToasterType.SCREENSHOT_CAPTURED>
  ) => dispatch(openToasterCreator({ message, type }));

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

  return {
    checkSimulatorSetup,
    connectToSimulatorFailure,
    connectToSimulatorSuccess,
    connectToSimulatorIframe,
    refreshState,
    finishOnboarding,
    openScreenshotsModal,
    openLoginModal,
    startLoadingLogin,
    stopLoadingLogin,
    stopLoadingReview,
    startLoadingReview,
    createCustomType,
    renameCustomType,
    initCustomTypeStore,
    saveCustomType,
    pushCustomType,
    createCustomTypeTab,
    updateCustomTypeTab,
    deleteCustomTypeTab,
    addCustomTypeField,
    deleteCustomTypeField,
    reorderCustomTypeField,
    replaceCustomTypeField,
    createSliceZone,
    deleteCustomTypeSharedSlice,
    replaceCustomTypeSharedSlice,
    updateFieldMockConfig,
    deleteFieldMockConfig,
    updateGroupFieldMockConfig,
    deleteGroupFieldMockConfig,
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
    saveSlice,
    pushSlice,
    copyVariationSlice,
    createSlice,
    renameSlice,
    sendAReview,
    skipReview,
    setUpdatesViewed,
    setSeenTutorialsToolTip,
    openCreateCustomTypeModal,
    openRenameCustomTypeModal,
    openScreenshotPreviewModal,
    openSimulatorSetupModal,
    openCreateSliceModal,
    openRenameSliceModal,
    closeModals,
    openToaster,
    pushChanges,
  };
};

export default useSliceMachineActions;
