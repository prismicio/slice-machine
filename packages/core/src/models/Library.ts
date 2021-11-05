import { Slice } from "./Slice";
import { SliceMock } from './SliceMock';
import { AsObject } from "./Variation";

export interface ComponentInfo {
  sliceName: string;
  fileName: string | null;
  isDirectory: boolean;
  extension: string | null;
  model: Slice<AsObject>;
  nameConflict:
    | {
        sliceName: string;
        id: any;
      }
    | null;

  previewUrls?: {
    [variationId: string]: Preview;
  };
  meta: ComponentMetadata;
  mock?: SliceMock
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
  model: Slice<AsObject>;
  migrated: boolean;
}

export interface Preview {
  variationId: string;
  isCustomPreview: boolean;
  hasPreview: boolean;
  url?: string;
}


export interface Library {
  name: string;
  isLocal: boolean;
  components: ReadonlyArray<Component>;
}

