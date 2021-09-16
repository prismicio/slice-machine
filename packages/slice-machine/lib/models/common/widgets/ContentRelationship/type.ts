import { Field, FieldType } from '../../CustomType/fields'
import {Media} from "@lib/models/common/widgets/Link/type";

interface ContentRelationshipFieldConfig {
  label: string,
  select: Media,
  customtypes: Array<string>
}
const defaultConfig = { label: '', select: Media.document, customtypes: [] }

export class ContentRelationshipField implements Field {
  config: ContentRelationshipFieldConfig;
  readonly type = FieldType.ContentRelationship;
  constructor(config: Partial<ContentRelationshipFieldConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }
}
