import { Field, FieldType, SimpleField } from "../../CustomType/fields";

export enum Media {
  media = "media",
  document = "document",
  web = "web",
}

interface LinkFieldConfig {
  label: string;
  placeholder: string;
  select: Media;
  allowTargetBlank: boolean;
  useAsTitle?: boolean;
  customtypes?: ReadonlyArray<string>;
  masks?: ReadonlyArray<string>;
  tags?: ReadonlyArray<string>;
}

const defaultConfig = {
  ...SimpleField.default,
  select: Media.web,
  allowTargetBlank: false,
};

export class LinkField implements Field {
  config: LinkFieldConfig;
  readonly type = FieldType.Link;
  constructor(config: Partial<LinkFieldConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }
}
