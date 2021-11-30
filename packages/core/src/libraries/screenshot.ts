import path from "path";
import Files from "../utils/files";

export enum Extensions {
  jpeg = "jpeg",
  jpg = "jpg",
  png = "png"
}

export function createPathToScreenshot({
  path: filePath,
  from,
  sliceName,
  variationId,
  extension
}: {
  path: string,
  from: string,
  sliceName: string,
  variationId: string,
  extension: Extensions
}) {
  return path.join(
    filePath,
    from,
    sliceName,
    variationId,
    `preview.${extension}`
  )
}

export function generatePathsToScreenshot({
  base,
  from,
  sliceName,
  variationId,
}: {
  base: string;
  from: string;
  sliceName: string;
  variationId: string;
}): Array<string> {
  return Object.values(Extensions).map((imageType: string) => {
    return path.join(
      base,
      from,
      sliceName,
      variationId,
      `preview.${imageType}`
    )
  });
}

export function resolvePathsToScreenshot({
  paths,
  from,
  sliceName,
  variationId,
}: {
  paths: Array<string>;
  from: string;
  sliceName: string;
  variationId: string;
}): { exists: boolean; path: string; } | undefined {
  const possiblePaths = paths.map((base) => {
    return generatePathsToScreenshot({
      base,
      from,
      sliceName,
      variationId
    })
  }).flat()
  return Files.readFirstOf<string, { exists: boolean; }>(possiblePaths)((v: string) => v);
}
