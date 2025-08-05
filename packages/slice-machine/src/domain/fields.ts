import { IconName } from "@prismicio/editor-ui";
import {
  FieldType,
  NestableFieldTypes,
} from "@prismicio/types-internal/lib/customtypes";

interface BaseField {
  description: string;
  icon: IconName;
  name: string;
  thumbnail: string;
  type: FieldType;
  variant?: FieldVariant;
}

export type NestableFieldVariant = "ContentRelationship" | "LinkToMedia";
export type GroupFieldVariant = "NestedGroup";
export type FieldVariant = NestableFieldVariant | GroupFieldVariant;

export interface NestableField extends BaseField {
  type: NestableFieldTypes;
  variant?: NestableFieldVariant;
}

export interface UIDField extends BaseField {
  type: "UID";
  variant?: never;
}

export interface GroupField extends BaseField {
  type: "Group";
  variant?: "NestedGroup";
}

export type Field = NestableField | UIDField | GroupField;

export type CustomFieldType = "LinkToMedia" | "ContentRelationship";

export const fieldLabels: Record<FieldType | CustomFieldType, string> = {
  Text: "Text",
  StructuredText: "Rich Text",
  Boolean: "Boolean",
  Number: "Number",
  Select: "Select",
  Link: "Link",
  LinkToMedia: "Link To Media",
  UID: "UID",
  Image: "Image",
  Group: "Repeatable Group",
  Color: "Color",
  Date: "Date",
  Table: "Table",
  Timestamp: "Timestamp",
  Embed: "Embed",
  GeoPoint: "Geopoint",
  ContentRelationship: "Content Relationship",
  IntegrationFields: "Integration Fields",
  Range: "Range",
  Separator: "Separator",
  Slices: "Slices",
  Choice: "Choice",
};

/**
 * Nestable fields
 */

export const booleanField: NestableField = {
  name: fieldLabels.Boolean,
  description: "A true or false toggle.",
  icon: "toggleOff",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295526/DEV_TOOLS/SM_FIELDS/Type_Boolean_cbwg8k.png",
  type: "Boolean",
};

export const colorField: NestableField = {
  name: fieldLabels.Color,
  description: "A color in hex format.",
  icon: "colorLens",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295521/DEV_TOOLS/SM_FIELDS/Type_Color_nyoeit.png",
  type: "Color",
};

export const dateField: NestableField = {
  name: fieldLabels.Date,
  description: "A date without time.",
  icon: "dateRange",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295525/DEV_TOOLS/SM_FIELDS/Type_Date_dsuaeq.png",
  type: "Date",
};

export const embedField: NestableField = {
  name: fieldLabels.Embed,
  description: "A video, song, or oEmbed link.",
  icon: "code",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295523/DEV_TOOLS/SM_FIELDS/Type_Embed_wwssvd.png",
  type: "Embed",
};

export const geoPointField: NestableField = {
  name: fieldLabels.GeoPoint,
  description: "A geographical coordinate.",
  icon: "place",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295522/DEV_TOOLS/SM_FIELDS/Type_GeoPoint_lpq0sm.png",
  type: "GeoPoint",
};

export const imageField: NestableField = {
  name: fieldLabels.Image,
  description: "A responsive image.",
  icon: "image",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295520/DEV_TOOLS/SM_FIELDS/Type_Image_zyatxy.png",
  type: "Image",
};

export const LinkField: NestableField = {
  name: fieldLabels.Link,
  description: "A link to a website, asset, or document.",
  icon: "link",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295528/DEV_TOOLS/SM_FIELDS/Type_Link_bgslgy.png",
  type: "Link",
};

export const contentRelationshipField: NestableField = {
  name: fieldLabels.ContentRelationship,
  description: "A reference to a Prismic document.",
  icon: "settingsEthernet",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295527/DEV_TOOLS/SM_FIELDS/Type_Content_RelationShip_s4z4nh.png",
  type: "Link",
  variant: "ContentRelationship",
};

export const LinkToMediaField: NestableField = {
  name: fieldLabels.LinkToMedia,
  description: "A link to a media asset.",
  icon: "attachFile",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295519/DEV_TOOLS/SM_FIELDS/Type_LinkToMedia_m2p0ce.png",
  type: "Link",
  variant: "LinkToMedia",
};

export const numberField: NestableField = {
  name: fieldLabels.Number,
  description: "An integer or float.",
  icon: "pin",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295522/DEV_TOOLS/SM_FIELDS/Type_Number_o3olop.png",
  type: "Number",
};

export const richTextField: NestableField = {
  name: fieldLabels.StructuredText,
  description: "Text with formatting options.",
  icon: "textFields",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295530/DEV_TOOLS/SM_FIELDS/Type_Rich_Text_fxdyar.png",
  type: "StructuredText",
};

export const selectField: NestableField = {
  name: fieldLabels.Select,
  description: "A dropdown of options.",
  icon: "arrowDropDownCircle",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295527/DEV_TOOLS/SM_FIELDS/Type_Select_bedjei.png",
  type: "Select",
};

export const tableField: NestableField = {
  name: fieldLabels.Table,
  description: "A structured table.",
  icon: "table",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1737381854/FIELDS_SM/Table_f47jnq.png",
  type: "Table",
};

export const textField: NestableField = {
  name: fieldLabels.Text,
  description: "A text string without formatting.",
  icon: "title",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295529/DEV_TOOLS/SM_FIELDS/Type_Key_Text_xrqf45.png",
  type: "Text",
};

export const timestampField: NestableField = {
  name: fieldLabels.Timestamp,
  description: "A date and time.",
  icon: "schedule",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295524/DEV_TOOLS/SM_FIELDS/Type_Timestamp_fkr5iw.png",
  type: "Timestamp",
};

export const nestableFields: NestableField[] = [
  imageField,
  textField,
  richTextField,
  booleanField,
  numberField,
  selectField,
  LinkField,
  LinkToMediaField,
  colorField,
  dateField,
  tableField,
  timestampField,
  embedField,
  geoPointField,
  contentRelationshipField,
];

/**
 * UID
 */

export const UIDField: UIDField = {
  name: fieldLabels.UID,
  description: "Unique Identifier",
  icon: "tag",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295519/DEV_TOOLS/SM_FIELDS/Type_UID_hrwzug.png",
  type: "UID",
};

/**
 * Group
 */

export const groupField: GroupField = {
  name: fieldLabels.Group,
  description: "A set of fields that editors can repeat.",
  icon: "createNewFolder",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721314577/DEV_TOOLS/SM_FIELDS/Type_Group_uwwco0.png",
  type: "Group",
};

export const nestedGroupField: GroupField = {
  ...groupField,
  variant: "NestedGroup",
};

export const groupFields: GroupField[] = [groupField, nestedGroupField];

/**
 * All fields
 */

export const fields = [...nestableFields, UIDField, ...groupFields];
