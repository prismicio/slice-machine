export { updateWidgetMockConfig, deleteWidgetMockConfig } from './mocks'

enum ActionType {
  Reset = 'reset',
  Push = 'push',
  Save = 'save-custom-type',
  CreateTab = 'create-tab',
  AddWidget= 'tab-add-widget',
  RemoveWidget = 'tab-remove-widget',
  DeleteTab = 'delete-tab',
  CreateSliceZone = 'tab-create-slicezone',
  DeleteSliceZone = 'tab-delete-slicezone',
  AddSharedSlice = 'tab-add-shared-slice',
  ReplaceSharedSlices = 'tab-replace-shared-slices',
  RemoveSharedSlice = 'tab-remove-shaed-slice',
  ReplaceWidget = 'tab-replace-widget',
  ReorderWidget = 'tab-reorder-widget',
  UpdateWidgetMockConfig = 'tab-update-widget-mock-config',
  DeleteWidgetMockConfig = 'tab-delete-widget-mock-config',

  GroupAddWidget =  'group-add-widget',
  GroupReorderWidget = 'group-reorder-widget',
  GroupDeleteWidget = 'group-delete-widget'
}

export default ActionType
