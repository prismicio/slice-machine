import path from "path";
import { isRight } from "fp-ts/Either";
import * as t from "io-ts";
import { Files } from "../node-utils";
import { SliceMock, SharedSliceContent } from "../models";

export function createPathToMock({
  path: filePath,
  from,
  sliceName,
}: {
  path: string;
  from: string;
  sliceName: string;
}): string {
  return path.join(filePath, from, sliceName, "mocks.json");
}

export function resolvePathsToMock({
  paths,
  from,
  sliceName,
}: {
  paths: ReadonlyArray<string>;
  from: string;
  sliceName: string;
}):
  | { path: string; value: SliceMock | SharedSliceContent | undefined }
  | undefined {
  const possiblePaths = paths.map((base) =>
    createPathToMock({ path: base, from, sliceName })
  );
  return Files.readFirstOf<SliceMock | SharedSliceContent | undefined>(
    possiblePaths
  )((v: string) => {
    const res = t.union([SliceMock, SharedSliceContent]).decode(JSON.parse(v)); // here
    if (isRight(res)) {
      return res.right;
    }
  });
}
