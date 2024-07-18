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

/**
 * Nestable fields
 */

export const booleanField: NestableField = {
  name: "Boolean",
  description: "A true or false toggle.",
  icon: "toggleOff",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295526/DEV_TOOLS/SM_FIELDS/Type_Boolean_cbwg8k.png",
  type: "Boolean",
};

export const colorField: NestableField = {
  name: "Color",
  description: "A color in hex format.",
  icon: "colorLens",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295521/DEV_TOOLS/SM_FIELDS/Type_Color_nyoeit.png",
  type: "Color",
};

export const dateField: NestableField = {
  name: "Date",
  description: "A date without time.",
  icon: "dateRange",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295525/DEV_TOOLS/SM_FIELDS/Type_Date_dsuaeq.png",
  type: "Date",
};

export const embedField: NestableField = {
  name: "Embed",
  description: "A video, song, or oEmbed link.",
  icon: "code",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295523/DEV_TOOLS/SM_FIELDS/Type_Embed_wwssvd.png",
  type: "Embed",
};

export const geoPointField: NestableField = {
  name: "Geopoint",
  description: "A geographical coordinate.",
  icon: "place",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295522/DEV_TOOLS/SM_FIELDS/Type_GeoPoint_lpq0sm.png",
  type: "GeoPoint",
};

export const imageField: NestableField = {
  name: "Image",
  description: "A responsive image.",
  icon: "image",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295520/DEV_TOOLS/SM_FIELDS/Type_Image_zyatxy.png",
  type: "Image",
};

export const LinkField: NestableField = {
  name: "Link",
  description: "A link to a website, asset, or document.",
  icon: "link",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295528/DEV_TOOLS/SM_FIELDS/Type_Link_bgslgy.png",
  type: "Link",
};

export const contentRelationshipField: NestableField = {
  name: "Content Relationship",
  description: "A reference to a Prismic document.",
  icon: "settingsEthernet",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295527/DEV_TOOLS/SM_FIELDS/Type_Content_RelationShip_s4z4nh.png",
  type: "Link",
  variant: "ContentRelationship",
};

export const LinkToMediaField: NestableField = {
  name: "Link To Media",
  description: "A link to a media asset.",
  icon: "attachFile",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295519/DEV_TOOLS/SM_FIELDS/Type_LinkToMedia_m2p0ce.png",
  type: "Link",
  variant: "LinkToMedia",
};

export const numberField: NestableField = {
  name: "Number",
  description: "An integer or float.",
  icon: "pin",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295522/DEV_TOOLS/SM_FIELDS/Type_Number_o3olop.png",
  type: "Number",
};

export const selectField: NestableField = {
  name: "Select",
  description: "A dropdown of options.",
  icon: "arrowDropDownCircle",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295527/DEV_TOOLS/SM_FIELDS/Type_Select_bedjei.png",
  type: "Select",
};

export const richTextField: NestableField = {
  name: "Rich Text",
  description: "Text with formatting options.",
  icon: "textFields",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295530/DEV_TOOLS/SM_FIELDS/Type_Rich_Text_fxdyar.png",
  type: "StructuredText",
};

export const textField: NestableField = {
  name: "Text",
  description: "A text string without formatting.",
  icon: "title",
  thumbnail:
    "https://res.cloudinary.com/dmtf1daqp/image/upload/v1721295529/DEV_TOOLS/SM_FIELDS/Type_Key_Text_xrqf45.png",
  type: "Text",
};

export const timestampField: NestableField = {
  name: "Timestamp",
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
  timestampField,
  embedField,
  geoPointField,
  contentRelationshipField,
];

/**
 * UID
 */

export const UIDField: UIDField = {
  name: "UID",
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
  name: "Repeatable Group",
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
