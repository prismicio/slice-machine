const TMP = "/tmp";

import fs from "fs";
import path from "path";

import { Volume } from "memfs";
import { IUnionFs, ufs } from "unionfs";

import {
  Extensions,
  resolvePathsToScreenshot,
} from "../../../src/libraries/screenshot";

jest.spyOn(console, "error").mockImplementationOnce(() => null);

interface IUnionFsWithReset extends Omit<IUnionFs, "use"> {
  fss: unknown;
  reset(): void;
  use(vol: unknown): this;
}

const unionedFs = fs as unknown as IUnionFsWithReset;

jest.mock(`fs`, () => {
  const realFs: typeof fs = jest.requireActual(`fs`);
  const unionfs = ufs as IUnionFsWithReset;
  unionfs.reset = () => {
    unionfs.fss = [realFs];
  };
  return unionfs.use(fs);
});

afterEach(() => {
  unionedFs.reset();
});

afterEach(() => {
  unionedFs.reset();
});

const testAcceptedTypes = (type: Extensions) => {
  unionedFs.use(
    Volume.fromJSON(
      {
        [`.slicemachine/assets/slices/SliceName/variation/preview.${type}`]:
          "123",
      },
      TMP
    )
  );

  const result = resolvePathsToScreenshot({
    paths: [TMP, path.join(TMP, ".slicemachine/assets")],
    from: "slices",
    sliceName: "SliceName",
    variationId: "variation",
  });
  expect(result).toBeDefined();
  expect(result?.value).toEqual("123");
  expect(result?.exists).toEqual(true);
};

test("it finds preview per type", () => {
  Object.values(Extensions).forEach((type) => testAcceptedTypes(type));
  expect(true).toBe(true);
});

test("it prioritizes custom preview path", () => {
  unionedFs.use(
    Volume.fromJSON(
      {
        "slices/SliceName/variation/preview.png": "456",
        ".slicemachine/assets/slices/SliceName/variation/preview.png": "123",
      },
      TMP
    )
  );

  const result = resolvePathsToScreenshot({
    paths: [TMP, path.join(TMP, ".slicemachine/assets")],
    from: "slices",
    sliceName: "SliceName",
    variationId: "variation",
  });
  expect(result).toBeDefined();
  expect(result?.value).toEqual("456");
  expect(result?.exists).toEqual(true);
});
