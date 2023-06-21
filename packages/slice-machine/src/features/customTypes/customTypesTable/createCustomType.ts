import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import type { CustomTypeFormat } from "@slicemachine/manager";

export function createCustomType(
  id: string,
  label: string,
  repeatable: boolean,
  format: CustomTypeFormat
): CustomType {
  const mainTab = makeMainTab(repeatable, format);

  return {
    id,
    label,
    format,
    repeatable,
    json: mainTab,
    status: true,
  };
}

function makeMainTab(
  repeatable: boolean,
  format: CustomTypeFormat
): CustomType["json"] {
  if (repeatable === false && format === "page") {
    return { ...DEFAULT_MAIN_WITH_SLICE_ZONE, ...DEFAULT_SEO_TAB };
  }

  if (repeatable === false) {
    return DEFAULT_MAIN;
  }

  if (format === "page") {
    return {
      ...DEFAULT_MAIN_WITH_UID_AND_SLICE_ZONE,
      ...DEFAULT_SEO_TAB,
    };
  }

  return DEFAULT_MAIN_WITH_UID;
}

const DEFAULT_MAIN: CustomType["json"] = {
  Main: {},
};

const DEFAULT_MAIN_WITH_SLICE_ZONE: CustomType["json"] = {
  Main: {
    slices: {
      config: {
        choices: {},
      },
      fieldset: "Slice Zone",
      type: "Slices",
    },
  },
};

const DEFAULT_MAIN_WITH_UID: CustomType["json"] = {
  Main: {
    uid: {
      config: {
        label: "UID",
      },
      type: "UID",
    },
  },
};

const DEFAULT_MAIN_WITH_UID_AND_SLICE_ZONE: CustomType["json"] = {
  Main: {
    ...DEFAULT_MAIN_WITH_UID.Main,
    ...DEFAULT_MAIN_WITH_SLICE_ZONE.Main,
  },
};

const DEFAULT_SEO_TAB: CustomType["json"] = {
  "SEO & Metadata": {
    meta_description: {
      config: {
        label: "Meta Description",
        placeholder: "A brief summary of the page",
      },
      type: "Text",
    },
    meta_image: {
      config: {
        constraint: {
          height: 1260,
          width: 2400,
        },
        label: "Meta Image",
        thumbnails: [],
      },
      type: "Image",
    },
    meta_title: {
      config: {
        label: "Meta Title",
        placeholder:
          "A title of the page used for social media and search engines",
      },
      type: "Text",
    },
  },
};
