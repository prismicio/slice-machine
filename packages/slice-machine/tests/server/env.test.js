import fs from "fs";
import { Volume } from "memfs";

import getEnv from "../../server/src/api/services/getEnv";
import { Models } from "@slicemachine/core";
import os from "os";

const TMP = "/tmp";

jest.mock(`fs`, () => {
  const fs = jest.requireActual(`fs`);
  const unionfs = require(`unionfs`).default;
  unionfs.reset = () => {
    unionfs.fss = [fs];
  };
  return unionfs.use(fs);
});

jest.spyOn(console, "error").mockImplementation(jest.fn());

afterEach(() => {
  fs.reset();
});

describe("getEnv", () => {
  test("it throws if no sm.json file is found", async () => {
    fs.use(Volume.fromJSON({}, TMP));
    await expect(getEnv(TMP)).rejects.toThrow();
  });

  test("it throws if no package.json file is found", async () => {
    fs.use(
      Volume.fromJSON(
        {
          "sm.json": "{}",
        },
        TMP
      )
    );
    await expect(getEnv(TMP)).rejects.toThrow();
  });

  test("it fails because api endpoint is missing", async () => {
    fs.use(
      Volume.fromJSON(
        {
          "sm.json": "{}",
          "package.json": "{}",
        },
        TMP
      )
    );

    await expect(getEnv(TMP)).rejects.toThrow();
  });

  test("it fails because api endpoint is invalid 1/2", async () => {
    fs.use(
      Volume.fromJSON(
        {
          "sm.json": `{ "apiEndpoint": "https://wroom.io/api/v2" }`,
          "package.json": "{}",
        },
        TMP
      )
    );

    await expect(getEnv(TMP)).rejects.toThrow();
  });

  test("it fails because api endpoint is invalid 2/2", async () => {
    fs.use(
      Volume.fromJSON(
        {
          "sm.json": `{ "apiEndpoint": "https://api-1.wroom.io/api" }`,
          "package.json": "{}",
        },
        TMP
      )
    );

    await expect(getEnv(TMP)).rejects.toThrow();
  });

  test("it validates stories path", async () => {
    fs.use(
      Volume.fromJSON(
        {
          "sm.json": JSON.stringify({
            apiEndpoint: "https://test.wroom.io/api/v2",
            framework: Models.Frameworks.vanillajs,
          }),
          "package.json": "{}",
          ".storybook/main.js": `import { getStoriesPaths } from '...'`,
        },
        TMP
      )
    );

    const { env } = await getEnv(TMP);
    expect(env.repo).toEqual("test");
    expect(env.manifest.apiEndpoint).toEqual("https://test.wroom.io/api/v2");
    expect(env.framework).toEqual(Models.Frameworks.vanillajs);
  });

  test("it finds the right Prismic repo", async () => {
    fs.use(
      Volume.fromJSON(
        {
          "sm.json": JSON.stringify({
            apiEndpoint: "https://api-1.wroom.io/api/v2",
            framework: "next",
          }),
          "package.json": "{}",
          "nuxt.config.js": `stories: [".slicemachine/assets"]`,
        },
        TMP
      )
    );

    const { env } = await getEnv(TMP);
    expect(env.repo).toEqual("api-1");
  });

  test("it creates empty mock config", async () => {
    fs.use(
      Volume.fromJSON(
        {
          "sm.json": JSON.stringify({
            apiEndpoint: "https://api-1.wroom.io/api/v2",
            framework: "none",
          }),
          "package.json": "{}",
          "nuxt.config.js": `stories: [".slicemachine/assets"]`,
        },
        TMP
      )
    );

    const { env } = await getEnv(TMP);
    expect(env.mockConfig).toEqual({});
  });

  test("it gets current mock config", async () => {
    fs.use(
      Volume.fromJSON(
        {
          "sm.json": JSON.stringify({
            apiEndpoint: "https://api-1.wroom.io/api/v2",
            framework: "next",
          }),
          "package.json": "{}",
          "nuxt.config.js": `stories: [".slicemachine/assets"]`,
          ".slicemachine/mock-config.json": `{ "field": "value" }`,
        },
        TMP
      )
    );

    const { env } = await getEnv(TMP);
    expect(env.mockConfig).toHaveProperty("field");
  });

  /** nuxt: 'nuxt',
   next: 'next',
   vue: 'vue',
   react: 'react'
   none: null

   */
  test("it finds the right framework in sm.json", async () => {
    for await (const framework of Models.SupportedFrameworks) {
      fs.reset();
      fs.use(
        Volume.fromJSON(
          {
            "sm.json": JSON.stringify({
              apiEndpoint: "https://api-1.wroom.io/api/v2",
              framework: framework,
            }),
            "package.json": `{}`,
            "nuxt.config.js": `stories: [".slicemachine/assets"]`,
            ".slicemachine/mock-config.json": `{ "field": "value" }`,
          },
          TMP
        )
      );

      const { env } = await getEnv(TMP);
      expect(env.framework).toEqual(framework);
    }
  });

  test("it uses framework defined in manifest", async () => {
    const key = "vue";
    fs.reset();
    fs.use(
      Volume.fromJSON(
        {
          "sm.json": `{ "framework": "${key}", "apiEndpoint": "https://api-1.wroom.io/api/v2", "storybook": "localhost:6666" }`,
          "package.json": `{ "scripts": { "storybook": "start-storybook" }, "dependencies": { "react": "1.1.0" } }`,
          "nuxt.config.js": `stories: [".slicemachine/assets"]`,
          ".slicemachine/mock-config.json": `{ "field": "value" }`,
        },
        TMP
      )
    );
    const { env } = await getEnv(TMP);
    expect(env.framework).toEqual(key);
  });

  test("when framework is not found in manifest, it writes an error to the console and throws the error", async () => {
    fs.reset();
    fs.use(
      Volume.fromJSON(
        {
          "sm.json": `{ "apiEndpoint": "https://api-1.wroom.io/api/v2", "storybook": "localhost:6666" }`,
          "package.json": `{ "scripts": { "storybook": "start-storybook" }, "dependencies": { "unknown": "1.1.0" } }`,
          "nuxt.config.js": `stories: [".slicemachine/assets"]`,
          ".slicemachine/mock-config.json": `{ "field": "value" }`,
        },
        TMP
      )
    );

    const message =
      'Property "framework" must be one of "none", "nuxt", "previousNuxt", "next", "gatsby", "vue", "react", "svelte", "vanillajs", "previousNext".';

    const errorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() => getEnv(TMP)).rejects.toThrow(message);

    expect(errorSpy).toHaveBeenCalledWith(message);
  });

  test("it should take the auth from .prismic and base from sm.json", async () => {
    fs.reset();
    fs.use(
      Volume.fromJSON(
        {
          "sm.json": JSON.stringify({
            apiEndpoint: "https://api-1.wroom.io/api/v2",
            framework: "next",
          }),
          "package.json": "{}",
        },
        TMP
      )
    );
    fs.use(
      Volume.fromJSON(
        {
          ".prismic": JSON.stringify({
            base: "https://prismic.io",
            cookies: "prismic-auth=biscuits",
          }),
        },
        os.homedir()
      )
    );

    const { env } = await getEnv(TMP);
    expect(env.isUserLoggedIn).toBeTruthy();
    expect(env.client.base).toEqual("https://wroom.io");
    expect(env.client.auth).toEqual("biscuits");
  });
});
