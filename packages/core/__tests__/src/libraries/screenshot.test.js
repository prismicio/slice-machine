const TMP = "/tmp"

import fs from "fs";
import { Volume } from "memfs";


import { getPathToScreenshot } from "../../../src/libraries/screenshot"
import { ACCEPTED_IMAGE_TYPES } from "../../../src/utils/const"

jest.mock(`fs`, () => {
  const fs = jest.requireActual(`fs`);
  const unionfs = require(`unionfs`).default;
  unionfs.reset = () => {
    unionfs.fss = [fs];
  };
  return unionfs.use(fs);
});

afterEach(() => {
  fs.reset();
});

const testAcceptedTypes = async (type) => {
  fs.use(
    Volume.fromJSON(
      {
        [`.slicemachine/assets/slices/SliceName/variation/preview.${type}`]: "123",
      },
      TMP
    )
  );

  const result = await getPathToScreenshot( { cwd: TMP, from: "slices", sliceName: "SliceName", variationId: "variation" });
  expect(result.value).toEqual("123");
  expect(result.exists).toEqual(true);
}

test("it finds preview per type", async () => {
  ACCEPTED_IMAGE_TYPES.forEach(type => testAcceptedTypes(type))
});

test("it prioritizes custom preview path", async () => {
  fs.use(
    Volume.fromJSON(
      {
        "slices/SliceName/variation/preview.png": "456",
        ".slicemachine/assets/slices/SliceName/variation/preview.png": "123",
      },
      TMP
    )
  );

  const result = await getPathToScreenshot( { cwd: TMP, from: "slices", sliceName: "SliceName", variationId: "variation" });
  expect(result.value).toEqual("456");
  expect(result.exists).toEqual(true);
});
