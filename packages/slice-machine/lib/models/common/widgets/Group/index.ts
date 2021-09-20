import * as yup from "yup";
import { DefaultFields } from "@lib/forms/defaults";
import { MdPlaylistAdd } from "react-icons/md";

import { FieldType } from "../../CustomType/fields";
import { Widget } from "../Widget";

import CustomListItem from "./ListItem";
import { AsArray, GroupField } from "./type";

const Meta = {
  icon: MdPlaylistAdd,
  title: "Group",
  description: "A Group of Prismic widgets",
};

const schema = yup.object().shape({
  type: yup
    .string()
    .matches(/^Group$/, { excludeEmptyString: true })
    .required(),
  config: yup.object().shape({
    fields: yup.array(),
    label: yup.string(),
    placeholder: yup.string(),
  }),
});

export const Group: Widget<GroupField<AsArray>, typeof schema> = {
  Meta,
  FormFields: DefaultFields,
  schema,
  create: (label: string) => new GroupField({ label }),
  CustomListItem,
  TYPE_NAME: FieldType.Group,
};
