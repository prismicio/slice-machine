import { VariationMock } from "./Variation";
import { SliceAsObject } from "./Slice";

export interface ComponentInfo {
  sliceName: string;
  fileName: string | null;
  isDirectory: boolean;
  extension: string | null;
  model: SliceAsObject;
  nameConflict: {
    sliceName: string;
    id: string;
  } | null;

  previewUrls?: {
    [variationId: string]: Preview;
  };
  meta: ComponentMetadata;
  mock?: ReadonlyArray<VariationMock>;
}

export const ComponentInfo = {
  hasPreviewsMissing(infos: ComponentInfo): boolean {
    const previews = infos.previewUrls;
    if (!previews) return true;

    return Object.entries(previews).reduce(
      (acc: boolean, [, preview]: [string, Preview]) => {
        return Boolean(!preview) || (acc && preview?.hasPreview);
      },
      false
    );
  },
};

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

export interface Preview {
  isCustomPreview: boolean;
  hasPreview: boolean;
  path?: string;
}

export interface Library<C extends Component> {
  name: string;
  path: string;
  isLocal: boolean;
  components: ReadonlyArray<C>;
}
