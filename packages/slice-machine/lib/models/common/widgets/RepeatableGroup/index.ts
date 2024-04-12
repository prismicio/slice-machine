import { GroupSM } from "@lib/models/common/Group";
import { MdPlaylistAdd } from "react-icons/md";
import * as yup from "yup";

import { DefaultFields } from "../../../../forms/defaults";
import { Widget } from "../Widget";
import Form from "../Group/Form";
import CustomListItem from "../Group/ListItem";

const Meta = {
  icon: MdPlaylistAdd,
  title: "Repeatable Group",
  description: "A repeatable group of Prismic fields",
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
    repeat: yup.bool().optional(),
  }),
});

export const RepeatableGroupWidget: Widget<GroupSM, typeof schema> = {
  Meta,
  Form,
  FormFields: DefaultFields,
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
  CUSTOM_NAME: "RepeatableGroup",
};
