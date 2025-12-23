import { SharedSliceContent } from "@prismicio/types-internal/lib/content";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

export type SliceImport = {
  image: File;
  model: SharedSlice;
  thumbnailUrl?: string;
  files?: SliceFile[];
  componentContents?: string;
  mocks?: SharedSliceContent[];
  screenshots?: Record<string, File>;
};

export type SliceFile = {
  path: string;
  contents: string | File;
  isBinary: boolean;
};

export type NewSlice = {
  image: File;
  model: SharedSlice;
  langSmithUrl?: string;
  files?: SliceFile[];
  componentContents?: string;
  mocks?: SharedSliceContent[];
  screenshots?: Record<string, File>;
};
