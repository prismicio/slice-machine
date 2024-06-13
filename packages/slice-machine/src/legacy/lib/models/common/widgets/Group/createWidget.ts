import { MdPlaylistAdd } from "react-icons/md";
import * as yup from "yup";

import { GroupSM, NestedGroupSM } from "@/legacy/lib/models/common/Group";
import { Widget } from "@/legacy/lib/models/common/widgets/Widget";

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

type createWidgetProps = {
  schemaTypeRegex: RegExp;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customListItem: (props: any) => React.ReactElement;
  customName?: "NestedGroup";
};

export function createWidget({
  schemaTypeRegex,
  customListItem,
}: createWidgetProps): Widget<GroupSM, SchemaType>;

export function createWidget({
  schemaTypeRegex,
  customListItem,
  customName,
}: createWidgetProps): Widget<NestedGroupSM, SchemaType>;

export function createWidget({
  schemaTypeRegex,
  customListItem,
  customName,
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
  };
}
