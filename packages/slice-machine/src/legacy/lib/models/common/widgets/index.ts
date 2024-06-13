import { GroupWidget as Group } from "./Group";
import { NestedGroupWidget as NestedGroup } from "./NestedGroup";
import { NonGroupWidgets } from "./nonGroupWidgets";

export const Widgets = {
  Group,
  NestedGroup,
  ...NonGroupWidgets,
};
