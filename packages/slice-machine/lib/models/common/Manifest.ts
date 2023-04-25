import * as t from "io-ts";

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

export const Manifest = t.intersection([
  t.type({
    apiEndpoint,
  }),
  t.partial({
    localSliceSimulatorURL: t.string,
    libraries: t.array(t.string),
    chromaticAppId: t.string,
    tracking: t.boolean,
    generateTypes: t.boolean,
  }),
]);

export type Manifest = t.TypeOf<typeof Manifest>;
