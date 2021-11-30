import { VariationMock } from './Variation';
import { SliceAsObject } from "./Slice";

export interface ComponentInfo {
  sliceName: string;
  fileName: string | null;
  isDirectory: boolean;
  extension: string | null;
  model: SliceAsObject;
  nameConflict:
    | {
        sliceName: string;
        id: string;
      }
    | null;

  screenshotPaths?: {
    [variationId: string]: Screenshot;
  };
  meta: ComponentMetadata;
  mock?: ReadonlyArray<VariationMock>
}

export interface ComponentMetadata {
  id: string;
  name?: string;
  description?: string;
}
export interface Component {
  from: string;
  href: string;
  pathToSlice: string;
  infos: ComponentInfo;
  model: SliceAsObject;
  migrated: boolean;
}

export interface Screenshot {
  exists: boolean;
  path?: string;
}


export interface Library {
  name: string;
  isLocal: boolean;
  components: ReadonlyArray<Component>;
}

