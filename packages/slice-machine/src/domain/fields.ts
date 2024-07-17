import { IconName } from "@prismicio/editor-ui";
import {
  BooleanFieldType,
  ColorFieldType,
  DateFieldType,
  EmbedFieldType,
  FieldType,
  GeoPointFieldType,
  Group,
  GroupFieldType,
  ImageFieldType,
  LinkFieldType,
  NestableFieldTypes,
  NumberFieldType,
  RichTextFieldType,
  SelectFieldType,
  TextFieldType,
  TimestampFieldType,
  UIDFieldType,
} from "@prismicio/types-internal/lib/customtypes";

export interface Field {
  description: string;
  icon: IconName;
  name: string;
  type: FieldType;
  variant?: FieldVariants;
}

export type NestableFieldVariants = "ContentRelationship" | "LinkToMedia";
export type GroupFieldVariants = "NestedGroup";
export type GroupFieldTemplateVariants = "SimpleGroup" | "AdvancedGroup";
export type FieldVariants =
  | NestableFieldVariants
  | GroupFieldVariants
  | GroupFieldTemplateVariants;

export interface NestableField extends Field {
  type: NestableFieldTypes;
  variant?: NestableFieldVariants;
}

export interface UIDField extends Field {
  type: typeof UIDFieldType;
  variant?: never;
}

export interface GroupField extends Field {
  type: typeof GroupFieldType;
  variant?: "NestedGroup";
}

export interface GroupFieldTemplate extends Field {
  type: typeof GroupFieldType;
  defaultValue: Group;
  variant: GroupFieldTemplateVariants;
}

/**
 * Nestable fields
 */

export const booleanField: NestableField = {
  name: "Boolean",
  description: "A true or false toggle.",
  icon: "toggleOff",
  type: BooleanFieldType,
};

export const colorField: NestableField = {
  name: "Color",
  description: "A color in hex format.",
  icon: "colorLens",
  type: ColorFieldType,
};

export const dateField: NestableField = {
  name: "Date",
  description: "A date without time.",
  icon: "dateRange",
  type: DateFieldType,
};

export const embedField: NestableField = {
  name: "Embed",
  description: "A video, song, or oEmbed link.",
  icon: "code",
  type: EmbedFieldType,
};

export const geoPointField: NestableField = {
  name: "Geopoint",
  description: "A geographical coordinate.",
  icon: "place",
  type: GeoPointFieldType,
};

export const imageField: NestableField = {
  name: "Image",
  description: "A responsive image.",
  icon: "image",
  type: ImageFieldType,
};

export const LinkField: NestableField = {
  name: "Link",
  description: "A link to a website, asset, or document.",
  icon: "link",
  type: LinkFieldType,
};

export const contentRelationshipField: NestableField = {
  name: "Content Relationship",
  description: "A reference to a Prismic document.",
  icon: "settingsEthernet",
  type: LinkFieldType,
  variant: "ContentRelationship",
};

export const LinkToMediaField: NestableField = {
  name: "Link To Media",
  description: "A link to a media asset.",
  icon: "attachFile",
  type: LinkFieldType,
  variant: "LinkToMedia",
};

export const numberField: NestableField = {
  name: "Number",
  description: "An integer or float.",
  icon: "pin",
  type: NumberFieldType,
};

export const selectField: NestableField = {
  name: "Select",
  description: "A dropdown of options.",
  icon: "arrowDropDownCircle",
  type: SelectFieldType,
};

export const richTextField: NestableField = {
  name: "Rich Text",
  description: "Text with formatting options.",
  icon: "textFields",
  type: RichTextFieldType,
};

export const textField: NestableField = {
  name: "Text",
  description: "A text string without formatting.",
  icon: "title",
  type: TextFieldType,
};

export const timestampField: NestableField = {
  name: "Timestamp",
  description: "A date and time.",
  icon: "schedule",
  type: TimestampFieldType,
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
  type: UIDFieldType,
};

/**
 * Group
 */

export const groupField: GroupField = {
  name: "Repeatable group",
  description: "A repeatable set of fields.",
  icon: "createNewFolder",
  type: GroupFieldType,
};

export const nestedGroupField: GroupField = {
  ...groupField,
  variant: "NestedGroup",
};

export const groupFields: GroupField[] = [groupField, nestedGroupField];

/**
 * Group field templates
 */

export const simpleGroupFieldTemplate: GroupFieldTemplate = {
  name: "Simple group",
  description: "A simple example group field.",
  icon: "folder",
  type: GroupFieldType,
  variant: "SimpleGroup",
  defaultValue: {
    type: "Group",
    config: {
      fields: {
        text: {
          type: "Text",
          config: {
            label: "A text",
          },
        },
        image: {
          type: "Image",
          config: {
            label: "An image",
          },
        },
      },
    },
  },
};

export const advancedGroupFieldTemplate: GroupFieldTemplate = {
  name: "Advanced group",
  description: "An advanced example group field.",
  icon: "folder",
  type: GroupFieldType,
  variant: "AdvancedGroup",
  defaultValue: {
    type: "Group",
    config: {
      fields: {
        nestedGroup: {
          type: "Group",
          config: {
            label: "A nested group",
            fields: {
              nestedText: {
                type: "Text",
                config: {
                  label: "A text",
                },
              },
              nestedImage: {
                type: "Image",
                config: {
                  label: "An image",
                },
              },
            },
          },
        },
      },
    },
  },
};

export const groupFieldTemplates: GroupFieldTemplate[] = [
  simpleGroupFieldTemplate,
  advancedGroupFieldTemplate,
];

/**
 * All fields
 */

export const fields = [
  ...nestableFields,
  UIDField,
  ...groupFields,
  ...groupFieldTemplates,
];
