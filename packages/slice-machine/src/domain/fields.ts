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
    "https://images.prismic.io/page-builder-assets/eNu185p5RoeA2vEt_type_boolean.png",
  type: "Boolean",
};

export const colorField: NestableField = {
  name: "Color",
  description: "A color in hex format.",
  icon: "colorLens",
  thumbnail:
    "https://images.prismic.io/page-builder-assets/_5fssbf3BC11bi90_type_color.png",
  type: "Color",
};

export const dateField: NestableField = {
  name: "Date",
  description: "A date without time.",
  icon: "dateRange",
  thumbnail:
    "https://images.prismic.io/page-builder-assets/mFrRV-KDeRUOv4af_type_date.png",
  type: "Date",
};

export const embedField: NestableField = {
  name: "Embed",
  description: "A video, song, or oEmbed link.",
  icon: "code",
  thumbnail:
    "https://images.prismic.io/page-builder-assets/m3hijHQZ8-43wjAY_type_embed.png",
  type: "Embed",
};

export const geoPointField: NestableField = {
  name: "Geopoint",
  description: "A geographical coordinate.",
  icon: "place",
  thumbnail:
    "https://images.prismic.io/page-builder-assets/dMrrrlXyQcZRHkSz_type_geopoint.png",
  type: "GeoPoint",
};

export const imageField: NestableField = {
  name: "Image",
  description: "A responsive image.",
  icon: "image",
  thumbnail:
    "https://images.prismic.io/page-builder-assets/sgckFInNFDAwjb6E_type_image.png",
  type: "Image",
};

export const linkField: NestableField = {
  name: "Link",
  description: "A link to a website, asset, or document.",
  icon: "link",
  thumbnail:
    "https://images.prismic.io/page-builder-assets/uYv2u7YT3MkHR2zA_type_link.png",
  type: "Link",
};

export const contentRelationshipField: NestableField = {
  name: "Content Relationship",
  description: "A reference to a Prismic document.",
  icon: "settingsEthernet",
  thumbnail:
    "https://images.prismic.io/page-builder-assets/0Tnq0nG_qEw_87t2_type_content_relationship.png",
  type: "Link",
  variant: "ContentRelationship",
};

export const linkToMediaField: NestableField = {
  name: "Link to Media",
  description: "A link to a media asset.",
  icon: "attachFile",
  thumbnail:
    "https://images.prismic.io/page-builder-assets/8qs_Nlh5gan24ufn_type_linktomedia.png",
  type: "Link",
  variant: "LinkToMedia",
};

export const numberField: NestableField = {
  name: "Number",
  description: "An integer or float.",
  icon: "pin",
  thumbnail:
    "https://images.prismic.io/page-builder-assets/ptyLDBk-qEBYPXtn_type_number.png",
  type: "Number",
};

export const richTextField: NestableField = {
  name: "Rich Text",
  description: "Text with formatting options.",
  icon: "textFields",
  thumbnail:
    "https://images.prismic.io/page-builder-assets/XKbYiFBhOcLEhX-Z_type_rich_text.png",
  type: "StructuredText",
};

export const selectField: NestableField = {
  name: "Select",
  description: "A dropdown of options.",
  icon: "arrowDropDownCircle",
  thumbnail:
    "https://images.prismic.io/page-builder-assets/JJDU6gZwpiOTrZWW_type_select.png",
  type: "Select",
};

export const tableField: NestableField = {
  name: "Table",
  description: "A structured table.",
  icon: "table",
  thumbnail:
    "https://images.prismic.io/page-builder-assets/ASRyKRJAUTlVQDTi_type_table.png",
  type: "Table",
};

export const textField: NestableField = {
  name: "Text",
  description: "A text string without formatting.",
  icon: "title",
  thumbnail:
    "https://images.prismic.io/page-builder-assets/Mu4OKEaVC9fc9m9s_type_key_text.png",
  type: "Text",
};

export const timestampField: NestableField = {
  name: "Timestamp",
  description: "A date and time.",
  icon: "schedule",
  thumbnail:
    "https://images.prismic.io/page-builder-assets/iPGD4wJKbAXw0-c-_type_timestamp.png",
  type: "Timestamp",
};

export const nestableFields: NestableField[] = [
  imageField,
  textField,
  richTextField,
  booleanField,
  numberField,
  selectField,
  linkField,
  linkToMediaField,
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

export const uidField: UIDField = {
  name: "UID",
  description: "Unique Identifier",
  icon: "tag",
  thumbnail:
    "https://images.prismic.io/page-builder-assets/-i3eIKa6b7Nit4Fm_type_uid.png",
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
    "https://images.prismic.io/page-builder-assets/PrW2uf_EbJaXXAiU_type_group.png",
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

export const fields = [...nestableFields, uidField, ...groupFields];
