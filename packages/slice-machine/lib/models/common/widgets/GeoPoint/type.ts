import { Field, FieldType } from "../../CustomType/fields";

interface GeoPointFieldConfig {
  label: string;
}
const defaultConfig = { label: "" };

export class GeoPointField implements Field {
  config: GeoPointFieldConfig;
  readonly type = FieldType.GeoPoint;
  constructor(config: Partial<GeoPointFieldConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }
}
