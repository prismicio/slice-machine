import { Field, FieldType } from '../../CustomType/fields'

interface ContentRelationshipFieldConfig {
  label: string,
  select: string,
  customtypes: Array<string>
}
const defaultConfig = { label: '', select: 'document', customtypes: [] }

export class ContentRelationshipField implements Field {
  config: ContentRelationshipFieldConfig;
  readonly type = FieldType.ContentRelationship;
  constructor(config: Partial<ContentRelationshipFieldConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }
}
