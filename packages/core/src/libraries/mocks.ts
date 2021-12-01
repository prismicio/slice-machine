import path from "path";
import { isRight } from "fp-ts/Either";

import { Files } from "../utils";
import { Models } from "@slicemachine/models";

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
  paths: Array<string>;
  from: string;
  sliceName: string;
}): { path: string; value: Models.SliceMock | undefined } | undefined {
  const possiblePaths = paths.map((base) =>
    createPathToMock({ path: base, from, sliceName })
  );
  return Files.readFirstOf<Models.SliceMock | undefined>(possiblePaths)(
    (v: string) => {
      const res = Models.SliceMock.decode(JSON.parse(v));
      if (isRight(res)) {
        return res.right;
      }
    }
  );
}
