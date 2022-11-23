import "@relmify/jest-fp-ts";
import {
  // generate,
  replaceLegacySliceMocks,
  replaceLegacyCustomTypeMocks,
} from "../../../server/src/api/common/generate";
import path from "path";
import { ComponentMocks } from "@slicemachine/core/build/models/Library";
import { vol } from "memfs";
import { LibraryUI } from "@lib/models/common/LibraryUI";
import { CustomTypeContent } from "@prismicio/types-internal/lib/content";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";

jest.mock(`fs`, () => {
  return jest.requireActual("memfs").vol;
});

const TMP_DIR = "tmp";

const STUB_LIBRARY_UI: LibraryUI = {
  meta: {
    version: "bar",
    isNodeModule: false,
    isDownloaded: false,
    isManual: false,
  },
  name: "slices",
  path: "slices",
  isLocal: true,
  components: [
    {
      screenshots: {},
      mockConfig: {},
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

describe("replaceLegacySliceMocks", () => {
  afterEach(() => {
    vol.reset();
  });

  const PATH_TO_MOCK = path.join("slices", "MySlice", "mocks.json");

  test("it should update old/invalid slice mocks to the new format", () => {
    vol.fromJSON(
      {
        [PATH_TO_MOCK]: JSON.stringify({}),
        [PATH_TO_GLOBAL_MOCK_CONFIG]: JSON.stringify({}),
      },
      TMP_DIR
    );

    replaceLegacySliceMocks(TMP_DIR, [STUB_LIBRARY_UI]);

    const file = vol.readFileSync(path.join(TMP_DIR, PATH_TO_MOCK), "utf-8");
    const result = JSON.parse(file as string);
    expect(ComponentMocks.decode(result)).toBeRight();
  });

  test.skip("it should replace valid mocks", () => {
    const wanted = {
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
    };

    vol.fromJSON(
      {
        [PATH_TO_GLOBAL_MOCK_CONFIG]: JSON.stringify({}),
        [PATH_TO_MOCK]: JSON.stringify(wanted),
      },
      TMP_DIR
    );

    replaceLegacySliceMocks(TMP_DIR, [STUB_LIBRARY_UI]);

    const file = vol.readFileSync(path.join(TMP_DIR, PATH_TO_MOCK), "utf-8");
    const result = JSON.parse(file as string);
    expect(ComponentMocks.decode(result)).toEqualRight(wanted);
  });
});

describe("replaceLegacyCustomTypeMocks", () => {
  afterEach(() => {
    vol.reset();
  });
  const PATH_TO_MOCK = path.join(
    ".slicemachine",
    "assets",
    "customtypes",
    "blog-post",
    "mocks.json"
  );

  test("it should migrate old custom-type mocks to the new format", () => {
    vol.fromJSON(
      {
        [PATH_TO_GLOBAL_MOCK_CONFIG]: JSON.stringify({}),
        [PATH_TO_MOCK]: JSON.stringify({
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

    replaceLegacyCustomTypeMocks(TMP_DIR, [STUB_CUSTOM_TYPE]);

    const file = vol.readFileSync(path.join(TMP_DIR, PATH_TO_MOCK));
    const result = JSON.parse(file as string);
    expect(CustomTypeContent.decode(result)).toBeRight();
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
        [PATH_TO_MOCK]: JSON.stringify(wanted),
      },
      TMP_DIR
    );

    replaceLegacyCustomTypeMocks(TMP_DIR, [STUB_CUSTOM_TYPE]);

    const file = vol.readFileSync(path.join(TMP_DIR, PATH_TO_MOCK));
    const result = JSON.parse(file as string);
    expect(CustomTypeContent.decode(result)).toEqualRight(wanted);
  });
});
