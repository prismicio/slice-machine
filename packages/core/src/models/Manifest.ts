import * as t from "io-ts";
import { Frameworks, FrameworksC } from "./Framework";

const apiEndpoint = new t.Type<string>(
  "apiEndpoint",
  (input: unknown): input is string => typeof input === "string",
  (input, context) => {
    if (typeof input !== "string")
      return t.failure(input, context, "apiEndpoint should be a string");

    try {
      new URL(input);
    } catch {
      return t.failure(
        input,
        context,
        "could not parse apiEndpoint: invalid url."
      );
    }

    const url = new URL(input);

    if (/\/api\/v2\/?$/.test(url.pathname) === false) {
      return t.failure(
        input,
        context,
        'apiEndpoint should end with "/api/v2".'
      );
    }

    const regx = new RegExp(
      "^https?://[a-z0-9][a-z0-9-]{2,}[a-z0-9](.cdn)?.(prismic.io|wroom.io|wroom.test|wroom-qa.com)/api/v2/?$",
      "gi"
    );
    const result = regx.test(input);

    return result
      ? t.success(input)
      : t.failure(input, context, `apiEndpoint should match ${regx.source}`);
  },
  t.identity
);

export const FrameworkCodec = new t.Type<Frameworks>(
  "framework",
  (input: unknown): input is Frameworks => FrameworksC.is(input),
  (input, context) => {
    const frameworks = Object.keys(Frameworks);
    if (typeof input !== "string" || !FrameworksC.is(input)) {
      return t.failure(
        input,
        context,
        `framework should be one of ${frameworks.join(
          ", "
        )}. Set framework to one of these values or remove it and slice-machine will guess the framework.`
      );
    }

    return t.success(input);
  },
  t.identity
);

export const Manifest = t.intersection([
  t.type({
    apiEndpoint,
  }),
  t.partial({
    framework: FrameworkCodec,
    storybook: t.string,
    localSliceSimulatorURL: t.string,
    libraries: t.array(t.string),
    chromaticAppId: t.string,
    _latest: t.string,
    tracking: t.boolean,
    generateTypes: t.boolean,
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
