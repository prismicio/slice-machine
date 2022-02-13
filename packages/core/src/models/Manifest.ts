import * as t from "io-ts";
import { FrameworksC } from "./Framework";

class ApiEndPointType extends t.Type<string> {
  constructor() {
    super(
      "apiEndpoint",
      (input: unknown): input is string => typeof input === "string",
      (input, context) => {
        if (typeof input !== "string") return t.failure(input, context);
        const regx = new RegExp(
          "^https?://[a-z0-9][a-z0-9-]{2,}[a-z0-9](.cdn)?.(prismic.io|wroom.io|wroom.test)/api/v2/?$",
          "gi"
        );
        const result = regx.test(input);
        return result
          ? t.success(input)
          : t.failure(
              input,
              context,
              `apiEndpoint should match ${regx.source}`
            );
      },
      t.identity
    );
  }
}

const apiEndpoint = new ApiEndPointType();

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
    plugins: t.array(t.string),
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
