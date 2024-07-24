import { GeoPoint } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { MdOutlinePlace } from "react-icons/md";
import * as yup from "yup";

import { DefaultFields } from "../../../../forms/defaults";
import { Widget } from "../Widget";

/** : {
  "type" : "GeoPoint",
  "config" : {
    "label" : "geopoints"
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
    .matches(/^GeoPoint$/, { excludeEmptyString: true })
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
  icon: MdOutlinePlace,
};

export const GeoPointWidget: Widget<GeoPoint, typeof schema> = {
  create: (label: string) => ({
    type: "GeoPoint",
    config: {
      label,
    },
  }),
  FormFields,
  TYPE_NAME: "GeoPoint",
  schema,
  Meta,
};
