import { Field, FieldType, SimpleField } from "../../CustomType/fields";
import { Media } from "@lib/models/common/widgets/Link/type";

interface LinkToMediaFieldConfig {
  label: string;
  placeholder: string;
  select: Media;
}
const defaultConfig = { ...SimpleField.default };

export class LinkToMediaField implements Field {
  config: LinkToMediaFieldConfig;
  readonly type = FieldType.LinkToMedia;
  constructor(config: Partial<LinkToMediaFieldConfig> = {}) {
    this.config = { ...defaultConfig, ...config, select: Media.media };
  }
}
