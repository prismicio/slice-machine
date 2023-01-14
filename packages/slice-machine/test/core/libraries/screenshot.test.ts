import { afterEach, expect, test, vi } from "vitest";
const TMP = "/tmp";
import path from "path";
import { vol } from "memfs";

import {
  Extensions,
  resolvePathsToScreenshot,
} from "../../../core/libraries/screenshot";

vi.spyOn(console, "error").mockImplementationOnce(() => null);

vi.mock(`fs`, () => {
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
