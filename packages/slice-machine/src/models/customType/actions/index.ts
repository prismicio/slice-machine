export {
  updateWidgetMockConfig,
  deleteWidgetMockConfig,
  updateWidgetGroupMockConfig,
  deleteWidgetGroupMockConfig,
} from "./mocks";

enum ActionType {
  Push = "push",
  Save = "save-custom-type",
  UpdateWidgetMockConfig = "tab-update-widget-mock-config",
  DeleteWidgetMockConfig = "tab-delete-widget-mock-config",
}

export default ActionType;
