import type Models from "@slicemachine/core/build/src/models";
import { SliceMockConfig } from "./MockConfig";
import { Screenshots } from "./Screenshots";

export interface SliceBody {
  sliceName: string;
  from: string;
}

export interface SliceSaveBody extends SliceBody {
  model: Models.SliceSM;
  mockConfig?: SliceMockConfig;
}

export interface SliceSaveResponse {
  screenshots: Screenshots;
  warning: string | null;
}

export interface SliceCreateResponse extends SliceSaveResponse {
  variationId: string;
}
