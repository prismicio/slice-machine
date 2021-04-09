export { updateWidgetMockConfig, deleteWidgetMockConfig } from './mocks'

enum ActionType {
  Test = 'test',
  Reset = 'reset',
  AddWidget= 'tab-add-widget',
  RemoveWidget = 'tab-remove-widget',
  CreateSliceZone = 'tab-create-slicezone',
  DeleteSliceZone = 'tab-delete-slicezone',
  ReplaceWidget = 'tab-replace-widget',
  ReorderWidget = 'tab-reorder-widget',
  UpdateWidgetMockConfig = 'tab-update-widget-mock-config',
  DeleteWidgetMockConfig = 'tab-delete-widget-mock-config'
}

export default ActionType
