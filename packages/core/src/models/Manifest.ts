import * as t from "io-ts";
import { FrameworksC } from "./Framework";

export const Manifest = t.intersection([
  t.type({
    apiEndpoint: t.string,
  }),
  t.partial({
    storybook: t.string,
    localSliceCanvasURL: t.string,
    libraries: t.array(t.string),
    framework: FrameworksC,
    chromaticAppId: t.string,
    _latest: t.string,
  }),
]);

export type Manifest = t.TypeOf<typeof Manifest>;

export const ManifestHelper = {
  localLibraries(
    manifest: Manifest
  ): ReadonlyArray<{ prefix: string; path: string }> {
    return (manifest.libraries || [])
      .filter((l) => l.startsWith("~/") || l.startsWith("@/"))
      .map((lib) => {
        const prefix = lib.indexOf("~") != -1 ? `~` : `@`;
        return {
          prefix,
          path: lib.replace(`${prefix}/`, ""),
          fullPath: lib,
        };
      });
  },
};
