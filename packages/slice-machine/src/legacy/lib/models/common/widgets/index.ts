import {
  AdvancedGroupTemplateWidget,
  GroupWidget as Group,
  SimpleGroupTemplateWidget,
} from "./Group";
import { NestedGroupWidget as NestedGroup } from "./NestedGroup";
import { NonGroupWidgets } from "./nonGroupWidgets";

export const Widgets = {
  Group,
  NestedGroup,
  ...NonGroupWidgets,
  SimpleGroup: SimpleGroupTemplateWidget,
  AdvancedGroup: AdvancedGroupTemplateWidget,
};
