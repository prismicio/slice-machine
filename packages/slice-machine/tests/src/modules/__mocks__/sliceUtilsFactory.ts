import { ComponentUI } from "@lib/models/common/ComponentUI";
import { LibraryUI } from "@lib/models/common/LibraryUI";
import { SlicesTypes } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { SliceSM } from "@slicemachine/core/build/models";

const DEFAULT_SLICE_SM: SliceSM = {
  id: "blog_section_three_column_cards",
  type: SlicesTypes.SharedSlice,
  name: "BlogSectionThreeColumnCards",
  description: "BlogSectionThreeColumnCards",
  variations: [],
};

const DEFAULT_COMPONENT_UI: ComponentUI = {
  from: "slices/marketing",
  href: "slices--marketing",
  pathToSlice: "./slices/marketing",
  fileName: "index",
  extension: "js",
  screenshots: {},
  mock: [],
  model: DEFAULT_SLICE_SM,
  mockConfig: {},
};

const DEFAULT_LIBRARY_UI = {
  path: "../../e2e-projects/next/slices/ecommerce",
  isLocal: true,
  name: "slices/ecommerce",
  components: [],
  meta: {
    isNodeModule: false,
    isDownloaded: false,
    isManual: true,
  },
};

export const generateSliceSM = (overrides: Partial<SliceSM>): SliceSM => {
  return {
    ...DEFAULT_SLICE_SM,
    ...overrides,
  };
};

export const generateComponentUI = (
  overrides?: Partial<ComponentUI>
): ComponentUI => {
  return {
    ...DEFAULT_COMPONENT_UI,
    ...overrides,
  };
};

export const generateLibraryUI = (
  overrides?: Partial<LibraryUI>
): LibraryUI => {
  return {
    ...DEFAULT_LIBRARY_UI,
    ...overrides,
  };
};
