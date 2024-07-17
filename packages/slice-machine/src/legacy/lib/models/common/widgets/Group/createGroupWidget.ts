import { Group, NestedGroup } from "@prismicio/types-internal/lib/customtypes";
import { MdOutlineCreateNewFolder } from "react-icons/md";
import * as yup from "yup";

import { TabField } from "@/legacy/lib/models/common/CustomType";
import {
  Groups,
  GroupSM,
  type NestedGroupSM,
} from "@/legacy/lib/models/common/Group";
import { type Widget } from "@/legacy/lib/models/common/widgets/Widget";

import { type GroupListItemProps } from ".";
import Form, { FormFields } from "./Form";

const Meta = {
  icon: MdOutlineCreateNewFolder,
};

const createSchema = (typeRegex: RegExp) =>
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

type CreateGroupWidgetArgsBase<T extends TabField> = {
  schemaTypeRegex: RegExp;
  customListItem: (props: GroupListItemProps<T>) => JSX.Element;
  hintItemName: string;
  customName?: string;
  customDefaultValue?: Group;
};
type CreateTopGroupWidgetArgs = CreateGroupWidgetArgsBase<GroupSM>;
type CreateNestedGroupWidgetArgs = CreateGroupWidgetArgsBase<NestedGroupSM> & {
  customName: "NestedGroup";
  customDefaultValue?: NestedGroup;
};
type CreateGroupWidgetArgs =
  | CreateTopGroupWidgetArgs
  | CreateNestedGroupWidgetArgs;

export function createGroupWidget(
  args: CreateTopGroupWidgetArgs,
): Widget<GroupSM, SchemaType>;

export function createGroupWidget(
  args: CreateNestedGroupWidgetArgs,
): Widget<NestedGroupSM, SchemaType>;

export function createGroupWidget({
  schemaTypeRegex,
  customListItem,
  customName,
  hintItemName,
  customDefaultValue,
}: CreateGroupWidgetArgs):
  | Widget<GroupSM, SchemaType>
  | Widget<NestedGroupSM, SchemaType> {
  return {
    Meta,
    Form,
    FormFields,
    schema: createSchema(schemaTypeRegex),
    create: (label: string) =>
      customDefaultValue
        ? Groups.toSM(customDefaultValue)
        : {
            type: "Group",
            config: {
              label,
              repeat: true,
              fields: [],
            },
          },
    CustomListItem: customListItem,
    TYPE_NAME: "Group",
    CUSTOM_NAME: customName,
    hintItemName,
  };
}
