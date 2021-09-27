import { Field, FieldType } from "../../CustomType/fields";

interface BooleanFieldConfig {
  label: string;
  placeholder_false: string;
  placeholder_true: string;
  default_value: boolean;
}
const defaultConfig = {
  label: "",
  placeholder_false: "false",
  placeholder_true: "true",
  default_value: false,
};

export class BooleanField implements Field {
  config: BooleanFieldConfig;
  readonly type = FieldType.Boolean;
  constructor(config: Partial<BooleanFieldConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }
}
