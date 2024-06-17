import { MdPlaylistAdd } from "react-icons/md";
import * as yup from "yup";

import { TabField } from "@/legacy/lib/models/common/CustomType";
import {
  type GroupSM,
  type NestedGroupSM,
} from "@/legacy/lib/models/common/Group";
import { type Widget } from "@/legacy/lib/models/common/widgets/Widget";

import { type GroupListItemProps } from ".";
import Form, { FormFields } from "./Form";

const Meta = {
  icon: MdPlaylistAdd,
  title: "Group",
  description: "A repeatable set of fields",
};

export const createSchema = (typeRegex: RegExp) =>
  yup.object().shape({
    type: yup
      .string()
      .matches(typeRegex, { excludeEmptyString: true })
      .required(),
    config: yup.object().shape({
      fields: yup.array(),
      label: yup.string(),
      placeholder: yup.string(),
      repeat: yup.boolean().optional(),
    }),
  });
export type SchemaType = ReturnType<typeof createSchema>;

type createWidgetPropsBase<T extends TabField> = {
  schemaTypeRegex: RegExp;
  customListItem: (props: GroupListItemProps<T>) => JSX.Element;
  subItemHintBase: string;
  customName?: string;
};
type createGroupWidgetProps = createWidgetPropsBase<GroupSM>;
type createNestedGroupWidgetProps = createWidgetPropsBase<NestedGroupSM> & {
  customName: "NestedGroup";
};
type createWidgetProps = createGroupWidgetProps | createNestedGroupWidgetProps;

export function createWidget(
  props: createGroupWidgetProps,
): Widget<GroupSM, SchemaType>;

export function createWidget(
  props: createNestedGroupWidgetProps,
): Widget<NestedGroupSM, SchemaType>;

export function createWidget({
  schemaTypeRegex,
  customListItem,
  customName,
  subItemHintBase,
}: createWidgetProps):
  | Widget<GroupSM, SchemaType>
  | Widget<NestedGroupSM, SchemaType> {
  return {
    Meta,
    Form,
    FormFields,
    schema: createSchema(schemaTypeRegex),
    create: (label: string) => ({
      type: "Group",
      config: {
        label,
        repeat: true,
        fields: [],
      },
    }),
    CustomListItem: customListItem,
    TYPE_NAME: "Group",
    CUSTOM_NAME: customName,
    SUB_ITEM_HINT_BASE: subItemHintBase,
  };
}
