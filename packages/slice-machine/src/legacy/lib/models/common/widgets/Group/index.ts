import { MdPlaylistAdd } from "react-icons/md";
import * as yup from "yup";

import { GroupSM } from "@/legacy/lib/models/common/Group";

import { Widget } from "../Widget";
import Form, { FormFields } from "./Form";
import CustomListItem from "./ListItem";

const Meta = {
  icon: MdPlaylistAdd,
  title: "Group",
  description: "A repeatable set of fields",
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
    repeat: yup.boolean().optional(),
  }),
});

export const GroupWidget: Widget<GroupSM, typeof schema> = {
  Meta,
  Form,
  FormFields,
  schema,
  create: (label: string) => ({
    type: "Group",
    config: {
      label,
      repeat: true,
      fields: [],
    },
  }),
  CustomListItem,
  TYPE_NAME: "Group",
};
