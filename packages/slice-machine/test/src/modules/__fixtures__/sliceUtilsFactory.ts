import { ComponentUI } from "@lib/models/common/ComponentUI";
import { LibraryUI } from "@lib/models/common/LibraryUI";
import { SliceSM } from "@lib/models/common/Slice";

const DEFAULT_SLICE_SM: SliceSM = {
  id: "blog_section_three_column_cards",
  type: "SharedSlice",
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
  mocks: [],
  model: DEFAULT_SLICE_SM,
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
