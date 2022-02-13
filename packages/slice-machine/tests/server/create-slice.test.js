// // @jest-environment node
import createSlice from "../../server/src/api/slices/create";
import { vol } from "memfs";
import os from "os";
// import * as screenshots from '../../server/src/api/screenshots'

beforeEach(() => {
  vol.reset();
});

jest.mock("fs", () => {
  const { vol } = jest.requireActual("memfs");
  return vol;
});

// jest.spyOn(screenshots, "generateScreenshot").mockResolvedValue({screenshots: {}, failure: []})
jest.mock("../../server/src/api/screenshots/generate", () => ({
  __esModule: true,
  generateScreenshot: () => Promise.resolve({ screenshots: {}, failure: [] }),
}));

const TMP = "/tmp";

describe("craeteSlice", () => {
  test("snapshot of disk writers", async () => {
    jest.spyOn(process, "cwd").mockReturnValue(TMP);

    vol.fromJSON(
      {
        "sm.json": JSON.stringify({
          apiEndpoint: "https://foobar.prismic.io/api/v2",
          framework: "next",
        }),
        slices: JSON.stringify({}),
      },
      TMP
    );

    vol.fromJSON(
      {
        ".prismic": JSON.stringify({
          base: "https://prismic.io",
          cookies: "prismic-auth=foo",
        }),
      },
      os.homedir()
    );
    const f = await createSlice({ sliceName: "TestSlice", from: "slices" });

    const result = vol.toJSON();
    console.log(JSON.stringify(result, null, 2));
    expect(result).toMatchSnapshot();
  });
});

// test("d", () => {
//   expect("a").toEqual("b")
// })
