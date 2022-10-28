import path from "path";
import { isRight } from "fp-ts/Either";
import { Files } from "../node-utils";
import { SliceMock } from "../models";

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
}): { path: string; value: SliceMock | undefined } | undefined {
  const possiblePaths = paths.map((base) =>
    createPathToMock({ path: base, from, sliceName })
  );
  return Files.readFirstOf<SliceMock | undefined>(possiblePaths)(
    (v: string) => {
      const res = SliceMock.decode(JSON.parse(v));
      if (isRight(res)) {
        return res.right;
      }
    }
  );
}
