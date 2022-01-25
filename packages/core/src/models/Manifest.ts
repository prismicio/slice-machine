import * as t from "io-ts";
import { FrameworksC } from "./Framework";

const apiEndpoint = new t.Type<string, string, unknown>(
  "apiEndpoint",
  (input: unknown): input is string => typeof input === "string",
  (input, context) => {
    if (typeof input !== "string") return t.failure(input, context);
    try {
      const url = new URL(input);
      if (url.pathname.replace(/\/$/, "") !== "/api/v2") {
        return t.failure(input, context);
      }
      if (
        url.hostname.endsWith(".prismic.io") ||
        url.hostname.endsWith(".wroom.io") ||
        url.hostname.endsWith(".wroom.test")
      ) {
        return t.success(input);
      }
      return t.failure(input, context);
    } catch {
      return t.failure(input, context);
    }
  },
  t.identity
);

export const Manifest = t.intersection([
  t.type({
    apiEndpoint,
  }),
  t.partial({
    storybook: t.string,
    localSliceSimulatorURL: t.string,
    libraries: t.array(t.string),
    framework: FrameworksC,
    chromaticAppId: t.string,
    _latest: t.string,
    tracking: t.boolean,
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
