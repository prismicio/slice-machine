import path from "path";
import { Files } from "../node-utils";
import { SharedSliceContent } from "@prismicio/types-internal/lib/documents/widgets/slices";

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
}): { path: string; value: SharedSliceContent[] | undefined } | undefined {
  const possiblePaths = paths.map((base) =>
    createPathToMock({ path: base, from, sliceName })
  );
  return Files.readFirstOf<SharedSliceContent[] | undefined>(possiblePaths)(
    (v: string) => {
      try {
        const res = JSON.parse(v) as unknown as SharedSliceContent[];
        return res;
      } catch {
        return undefined;
      }
    }
  );
}
