import { Table } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { FaTable } from "react-icons/fa";
import * as yup from "yup";

import { DefaultFields } from "../../../../forms/defaults";
import { Widget } from "../Widget";

/** : {
  "type" : "Table",
  "config" : {
    "label" : "Gable's Fabled Table"
  }
} */

const FormFields = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  label: DefaultFields.label,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  id: DefaultFields.id,
};

const schema = yup.object().shape({
  type: yup
    .string()
    .matches(/^Table$/, { excludeEmptyString: true })
    .required(),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  config: yup
    .object()
    .shape({
      label: yup.string(),
    })
    .required()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    .default(undefined)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    .noUnknown(true),
});

const Meta = {
  icon: FaTable,
};

export const TableWidget: Widget<Table, typeof schema> = {
  create: (label: string) => ({
    type: "Table",
    config: {
      label,
    },
  }),
  FormFields,
  TYPE_NAME: "Table",
  schema,
  Meta,
};
