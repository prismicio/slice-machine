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
  hasSeenTutorialsTooTipCreator,
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
import { createCustomTypeCreator } from "@src/modules/customTypes";
import { createSliceCreator } from "@src/modules/slices";
import { UserContextStoreType } from "./userContext/types";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
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
  pushCustomTypeCreator,
  addFieldIntoGroupCreator,
  deleteFieldIntoGroupCreator,
  reorderFieldIntoGroupCreator,
  replaceFieldIntoGroupCreator,
  updateGroupFieldMockConfigCreator,
  deleteGroupFieldMockConfigCreator,
  deleteFieldMockConfigCreator,
  updateFieldMockConfigCreator,
} from "@src/modules/customType";
import { ArrayTabs, CustomType } from "@models/common/CustomType";
import { Field } from "@models/common/CustomType/fields";
import { CustomTypeMockConfig } from "@models/common/MockConfig";

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
  const setSeenTutorialsToolTip = () =>
    dispatch(hasSeenTutorialsTooTipCreator());

  // Custom types module
  const createCustomType = (id: string, label: string, repeatable: boolean) =>
    dispatch(createCustomTypeCreator.request({ id, label, repeatable }));

  // Custom type module
  const initCustomTypeStore = (
    model: CustomType<ArrayTabs>,
    remoteModel: CustomType<ArrayTabs> | null,
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
  const addCustomTypeField = (tabId: string, fieldId: string, field: Field) =>
    dispatch(addFieldCreator({ tabId, fieldId, field }));
  const deleteCustomTypeField = (tabId: string, fieldId: string) =>
    dispatch(deleteFieldCreator({ tabId, fieldId }));
  const reorderCustomTypeField = (tabId: string, start: number, end: number) =>
    dispatch(reorderFieldCreator({ tabId, start, end }));
  const replaceCustomTypeField = (
    tabId: string,
    previousFieldId: string,
    newFieldId: string,
    value: Field
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
    field: Field
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
    value: Field
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
    createSlice,
    sendAReview,
    skipReview,
    setUpdatesViewed,
    setSeenTutorialsToolTip,
    closeCreateCustomTypeModal,
    openCreateCustomTypeModal,
    openCreateSliceModal,
    closeCreateSliceModal,
    openToaster,
  };
};

export default useSliceMachineActions;
