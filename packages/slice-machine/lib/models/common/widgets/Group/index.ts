import * as yup from "yup";
import { MdPlaylistAdd } from "react-icons/md";
import { Widget } from "../Widget";
import CustomListItem from "./ListItem";
import { GroupSM } from "@lib/models/common/Group";
import Form, { FormFields } from "./Form";

const Meta = {
  icon: MdPlaylistAdd,
  title: "Group",
  description: "A Group of Prismic fields",
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
