import { Field, FieldType, SimpleField } from "../../CustomType/fields";
import { optionValues } from "./options";

interface StructuredTextFieldConfig {
  label: string;
  placeholder: string;
  single?: string;
  multi?: string;
  allowTargetBlank: boolean;
}

const defaultConfig = {
  ...SimpleField.default,
  allowTargetBlank: true,
  single: optionValues.join(","),
};

export class StructuredTextField implements Field {
  config: StructuredTextFieldConfig;
  readonly type = FieldType.StructuredText;
  constructor(config: Partial<StructuredTextFieldConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }
}
