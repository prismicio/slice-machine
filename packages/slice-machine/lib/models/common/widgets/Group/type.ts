import { Field, FieldType } from "../../CustomType/fields";
import { SliceZone } from "../../CustomType/sliceZone";

export type AsArray = ReadonlyArray<{ key: string; value: Field }>;
export type AsObject = { [key: string]: Field | SliceZone };

interface GroupConfig<T extends AsObject | AsArray> {
  label: string;
  placeholder: string;
  fields: T;
}
const defaultConfig = { label: "", placeholder: "", fields: [] as any }; //eslint-disable-line

export class GroupField<T extends AsObject | AsArray> implements Field {
  config: GroupConfig<T>;
  readonly type = FieldType.Group;
  constructor(config: Partial<GroupConfig<T>> = {}) {
    this.config = { ...defaultConfig, ...config };
  }
}
