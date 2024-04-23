import * as yup from "yup";
import { MdPlace } from "react-icons/md";

import { DefaultFields } from "../../../../forms/defaults";

import { Widget } from "../Widget";
import { GeoPoint } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";

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
    .default(undefined)
    .noUnknown(true),
});

const Meta = {
  icon: MdPlace,
  title: "GeoPoint",
  description: "A field for storing geo-coordinates",
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
