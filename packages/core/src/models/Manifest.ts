import * as t from "io-ts";
import { Frameworks, FrameworksC } from "./Framework";
import { fromUrl, parseDomain, ParseResultType } from "parse-domain";

const apiEndpoint = new t.Type<string>(
  "apiEndpoint",
  (input: unknown): input is string => typeof input === "string",
  (input, context) => {
    if (typeof input !== "string")
      return t.failure(input, context, "apiEndpoint should be a string");

    const endpoint = fromUrl(input);
    const parsedRepo = parseDomain(endpoint);

    if (parsedRepo.type !== ParseResultType.Listed)
      return t.failure(input, context, "could not parse apiEndpoint");

    if (parsedRepo.subDomains.length === 0) {
      return t.failure(input, context, "could not parse apiEndpoint");
    }

    if (!input.endsWith("api/v2") && !input.endsWith("api/v2/")) {
      return t.failure(
        input,
        context,
        "could not parse apiEndpoint, apiEndpoint should end with api/v2"
      );
    }

    if (!parsedRepo.labels[0] || !parsedRepo.subDomains[0]) {
      return t.failure(input, context, "could not parse apiEndpoint");
    }

    const regx = new RegExp(
      "^https?://[a-z0-9][a-z0-9-]{2,}[a-z0-9](.cdn)?.(prismic.io|wroom.io|wroom.test)/api/v2/?$",
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
