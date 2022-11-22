import type Models from "@prismic-beta/slicemachine-core/build/models";
import { SliceMockConfig } from "./MockConfig";

export interface SliceBody {
  sliceName: string;
  from: string;
}

export interface SliceSaveBody extends SliceBody {
  model: Models.SliceSM;
  mockConfig?: SliceMockConfig;
}

export interface SliceCreateResponse {
  variationId: string;
}
