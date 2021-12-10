const TMP = "/tmp";
import path from "path";
import { vol } from "memfs";

import {
  Extensions,
  resolvePathsToScreenshot,
} from "../../../src/libraries/screenshot";

jest.spyOn(console, "error").mockImplementationOnce(() => null);

jest.mock(`fs`, () => {
  return vol;
});

afterEach(() => {
  vol.reset();
});

test("it finds preview per type", () => {
  Object.values(Extensions).forEach((type) => {
    vol.fromJSON(
      {
        [`.slicemachine/assets/slices/SliceName/variation/preview.${type}`]:
          "123",
      },
      TMP
    );

    const result = resolvePathsToScreenshot({
      paths: [TMP, path.join(TMP, ".slicemachine/assets")],
      from: "slices",
      sliceName: "SliceName",
      variationId: "variation",
    });
    expect(result).toBeDefined();
  });
});

test("it prioritizes custom preview path", () => {
  vol.fromJSON(
    {
      "slices/SliceName/variation/preview.png": "456",
      ".slicemachine/assets/slices/SliceName/variation/preview.png": "123",
    },
    TMP
  );

  const result = resolvePathsToScreenshot({
    paths: [TMP, path.join(TMP, ".slicemachine/assets")],
    from: "slices",
    sliceName: "SliceName",
    variationId: "variation",
  });
  expect(result).toBeDefined();
});
