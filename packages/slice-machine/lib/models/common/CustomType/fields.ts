import { SliceZoneType } from "./sliceZone";

export enum FieldType {
  Boolean = "Boolean",
  GeoPoint = "GeoPoint",
  Select = "Select",
  Color = "Color",
  Group = "Group",
  StructuredText = "StructuredText",
  Image = "Image",
  Text = "Text",
  Date = "Date",
  Link = "Link",
  LinkToMedia = "Link",
  ContentRelationship = "Link",
  Timestamp = "Timestamp",
  Embed = "Embed",
  Number = "Number",
  UID = "UID",
}

export interface SimpleField {
  label: string;
  placeholder: string;
}
export const SimpleField = {
  default: { label: "", placeholder: "" },
};

export interface Field {
  type: FieldType | SliceZoneType;
  fieldset?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
}
