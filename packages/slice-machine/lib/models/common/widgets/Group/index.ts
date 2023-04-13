import * as yup from "yup";
import { DefaultFields } from "@lib/forms/defaults";
import { MdPlaylistAdd } from "react-icons/md";
import { Widget } from "../Widget";
import CustomListItem from "./ListItem";
import { GroupSM } from "@lib/models/common/Group";

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
  }),
});

export const GroupWidget: Widget<GroupSM, typeof schema> = {
  Meta,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  FormFields: DefaultFields,
  schema,
  create: (label: string) => ({
    type: "Group",
    config: {
      label,
      fields: [],
    },
  }),
  CustomListItem,
  TYPE_NAME: "Group",
};
