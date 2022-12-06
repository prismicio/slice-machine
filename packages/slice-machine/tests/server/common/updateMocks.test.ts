import "@relmify/jest-fp-ts";
import {
  replaceLegacySliceMocks,
  replaceLegacyCustomTypeMocks,
  updateMocks,
} from "../../../server/src/api/common/udpateMocks";
import path from "path";
import {
  Component,
  ComponentMocks,
  Library,
} from "@slicemachine/core/build/models/Library";
import { vol } from "memfs";
import { Document } from "@prismicio/types-internal/lib/content";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";

jest.mock(`fs`, () => {
  return jest.requireActual("memfs").vol;
});

const TMP_DIR = "tmp";

const STUB_LIBRARY_UI: Library<Component> = {
  meta: {
    version: "bar",
  },
  name: "slices",
  path: "slices",
  isLocal: true,
  components: [
    {
      screenshots: {},
      from: path.join("slices", "MySlice"),
      href: "",
      pathToSlice: "",
      fileName: "",
      extension: "",
      model: {
        id: "MySlice",
        type: "SharedSlice",
        name: "",
        variations: [
          {
            id: "default-slice",
            name: "Default slice",
            docURL: "...",
            version: "sktwi1xtmkfgx8626",
            description: "My Slice",
            primary: [
              {
                key: "title",
                value: {
                  config: { label: "Section Title", placeholder: "" },
                  type: "Text",
                },
              },
            ],
            items: [
              {
                key: "subTitle",
                value: {
                  config: { label: "Sub Section Title", placeholder: "" },
                  type: "Text",
                },
              },
            ],
          },
        ],
      },
    },
  ],
};

const STUB_CUSTOM_TYPE: CustomTypeSM = {
  id: "blog-post",
  label: "Blog Post",
  repeatable: false,
  tabs: [
    {
      key: "Main",
      value: [
        {
          key: "uid",
          value: {
            type: "UID",
            config: { label: "uid label", placeholder: "" },
          },
        },
        {
          key: "title",
          value: {
            config: {
              label: "Title",
              placeholder: "",
              allowTargetBlank: true,
              single: "heading1,heading2,heading3,heading4,heading5,heading6",
            },
            type: "StructuredText",
          },
        },
      ],
    },
  ],
  status: true,
};

const PATH_TO_GLOBAL_MOCK_CONFIG = path.join(
  ".slicemachine",
  "mock-config.json"
);

const PATH_TO_MOCK_SLICE = path.join("slices", "MySlice", "mocks.json");

describe("replaceLegacySliceMocks", () => {
  afterEach(() => {
    vol.reset();
  });

  test("it should update old/invalid slice mocks to the new format", () => {
    vol.fromJSON(
      {
        [PATH_TO_MOCK_SLICE]: JSON.stringify({}),
        [PATH_TO_GLOBAL_MOCK_CONFIG]: JSON.stringify({}),
      },
      TMP_DIR
    );

    replaceLegacySliceMocks(TMP_DIR, [STUB_LIBRARY_UI]);

    const file = vol.readFileSync(
      path.join(TMP_DIR, PATH_TO_MOCK_SLICE),
      "utf-8"
    );
    const result = JSON.parse(file as string);
    expect(ComponentMocks.decode(result)).toBeRight();
  });

  test("it should replace valid mocks", () => {
    const wanted = [
      {
        __TYPE__: "SharedSliceContent",
        variation: "default-slice",
        primary: {
          title: { __TYPE__: "FieldContent", value: "chemical", type: "Text" },
        },
        items: [
          {
            __TYPE__: "GroupItemContent",
            value: [
              [
                "subTitle",
                { __TYPE__: "FieldContent", value: "clean", type: "Text" },
              ],
            ],
          },
        ],
      },
    ];

    vol.fromJSON(
      {
        [PATH_TO_GLOBAL_MOCK_CONFIG]: JSON.stringify({}),
        [PATH_TO_MOCK_SLICE]: JSON.stringify(wanted),
      },
      TMP_DIR
    );

    replaceLegacySliceMocks(TMP_DIR, [STUB_LIBRARY_UI]);

    const file = vol.readFileSync(
      path.join(TMP_DIR, PATH_TO_MOCK_SLICE),
      "utf-8"
    );
    const result = JSON.parse(file as string);
    expect(ComponentMocks.decode(result)).toEqualRight(wanted);
  });
});

const PATH_TO_MOCK_CUSTOM_TYPE = path.join(
  ".slicemachine",
  "assets",
  "customtypes",
  "blog-post",
  "mocks.json"
);

describe("replaceLegacyCustomTypeMocks", () => {
  afterEach(() => {
    vol.reset();
  });

  test("it should migrate old custom-type mocks to the new format", () => {
    vol.fromJSON(
      {
        [PATH_TO_GLOBAL_MOCK_CONFIG]: JSON.stringify({}),
        [PATH_TO_MOCK_CUSTOM_TYPE]: JSON.stringify({
          id: "8027b84e-e405-42f3-ad5c-d636c305e99f",
          uid: "🦆",
          type: "blog-post",
          data: {
            title: [
              {
                type: "heading1",
                text: "quack",
                spans: [],
              },
            ],
          },
        }),
      },
      TMP_DIR
    );

    replaceLegacyCustomTypeMocks(TMP_DIR, [STUB_CUSTOM_TYPE], []);

    const file = vol.readFileSync(path.join(TMP_DIR, PATH_TO_MOCK_CUSTOM_TYPE));
    const result = JSON.parse(file as string);
    expect(Document.decode(result)).toBeRight();
  });

  test("it should not change valid mocks", () => {
    const wanted = {
      uid: { __TYPE__: "UIDContent", value: "divide" },
      title: {
        __TYPE__: "StructuredTextContent",
        value: [{ type: "heading1", content: { text: "Friend" } }],
      },
    };

    vol.fromJSON(
      {
        [PATH_TO_GLOBAL_MOCK_CONFIG]: JSON.stringify({}),
        [PATH_TO_MOCK_CUSTOM_TYPE]: JSON.stringify(wanted),
      },
      TMP_DIR
    );

    replaceLegacyCustomTypeMocks(TMP_DIR, [STUB_CUSTOM_TYPE], []);

    const file = vol.readFileSync(path.join(TMP_DIR, PATH_TO_MOCK_CUSTOM_TYPE));
    const result = JSON.parse(file as string);
    expect(Document.decode(result)).toEqualRight(wanted);
  });
});

const STUB_SLICE_MODEL = {
  id: "my_slice",
  type: "SharedSlice",
  name: "MySlice",
  description: "TestSlice",
  variations: [
    {
      id: "default",
      name: "Default",
      docURL: "...",
      version: "sktwi1xtmkfgx8626",
      description: "TestSlice",
      primary: {
        title: {
          type: "StructuredText",
          config: {
            single: "heading1",
            label: "Title",
            placeholder: "This is where it all begins...",
          },
        },
        description: {
          type: "StructuredText",
          config: {
            single: "paragraph",
            label: "Description",
            placeholder: "A nice description of your feature",
          },
        },
      },
      imageUrl:
        "https://images.prismic.io/slice-machine/621a5ec4-0387-4bc5-9860-2dd46cbc07cd_default_ss.png?auto=compress,format",
      items: {},
    },
  ],
};

describe("updateMocks", () => {
  afterEach(() => {
    vol.reset();
  });

  test("it should update the mocks for slice and custom-types if they invalid", () => {
    const PATH_TO_CUSTOM_TYPE = path.join(
      "customtypes",
      "blog-page",
      "index.json"
    );
    const PATH_TO_SLICE = path.join("slices", "MySlice", "model.json");

    vol.fromJSON(
      {
        [PATH_TO_GLOBAL_MOCK_CONFIG]: JSON.stringify({}),
        [PATH_TO_CUSTOM_TYPE]: JSON.stringify(STUB_CUSTOM_TYPE),
        [PATH_TO_SLICE]: JSON.stringify(STUB_SLICE_MODEL),
        [PATH_TO_MOCK_CUSTOM_TYPE]: JSON.stringify({}),
        [PATH_TO_MOCK_SLICE]: JSON.stringify({}),
      },
      TMP_DIR
    );

    updateMocks(TMP_DIR, ["@/slices"]);

    const sliceMock = vol.readFileSync(
      path.join(TMP_DIR, PATH_TO_MOCK_SLICE),
      "utf-8"
    );
    expect(ComponentMocks.decode(JSON.parse(sliceMock as string))).toBeRight();

    const customTypeMock = vol.readFileSync(
      path.join(TMP_DIR, PATH_TO_MOCK_CUSTOM_TYPE),
      "utf-8"
    );
    expect(Document.decode(JSON.parse(customTypeMock as string))).toBeRight();
  });
});
