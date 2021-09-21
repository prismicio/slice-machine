import * as yup from "yup";
import { MdPlace } from "react-icons/md";
import { handleMockConfig, handleMockContent } from "./Mock";
import { MockConfigForm } from "./Mock/Form";

import { DefaultFields } from "../../../../forms/defaults";

import { Widget } from "../Widget";
import { GeoPointField } from "./type";
import { FieldType } from "../../CustomType/fields";

/** : {
  "type" : "GeoPoint",
  "config" : {
    "label" : "geopoints"
  }
} */

const FormFields = {
  id: DefaultFields.id,
  label: DefaultFields.label,
};

const schema = yup.object().shape({
  type: yup
    .string()
    .matches(/^GeoPoint$/, { excludeEmptyString: true })
    .required(),
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

export const GeoPointWidget: Widget<GeoPointField, typeof schema> = {
  create: (label: string) => new GeoPointField({ label }),
  handleMockConfig,
  handleMockContent,
  MockConfigForm,
  FormFields,
  TYPE_NAME: FieldType.GeoPoint,
  schema,
  Meta,
};
