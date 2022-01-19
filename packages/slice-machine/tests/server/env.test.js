import fs from "fs";
import { Volume } from "memfs";

import getEnv from "../../server/src/api/services/getEnv";
import { Models } from "@slicemachine/core";

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
          "sm.json": `{ "apiEndpoint": "https://api.wroom.io/api" }`,
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
          "sm.json": `{ "apiEndpoint": "https://api.wroom.io/api/v2" }`,
          "package.json": "{}",
          ".storybook/main.js": `import { getStoriesPaths } from '...'`,
        },
        TMP
      )
    );

    const { env } = await getEnv(TMP);
    expect(env.repo).toEqual("api");
    expect(env.manifest.apiEndpoint).toEqual("https://api.wroom.io/api/v2");
    expect(env.framework).toEqual(Models.Frameworks.vanillajs);
  });

  test("it finds the right Prismic repo", async () => {
    fs.use(
      Volume.fromJSON(
        {
          "sm.json": `{ "apiEndpoint": "https://api.wroom.io/api/v2" }`,
          "package.json": "{}",
          "nuxt.config.js": `stories: [".slicemachine/assets"]`,
        },
        TMP
      )
    );

    const { env } = await getEnv(TMP);
    expect(env.repo).toEqual("api");
  });

  test("it creates empty mock config", async () => {
    fs.use(
      Volume.fromJSON(
        {
          "sm.json": `{ "apiEndpoint": "https://api.wroom.io/api/v2" }`,
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
          "sm.json": `{ "apiEndpoint": "https://api.wroom.io/api/v2" }`,
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
  test("it finds the right framework in package.json", async () => {
    for await (const framework of Models.SupportedFrameworks) {
      fs.reset();
      fs.use(
        Volume.fromJSON(
          {
            "sm.json": `{ "apiEndpoint": "https://api.wroom.io/api/v2", "storybook": "localhost:6666" }`,
            "package.json": `{ "scripts": { "storybook": "start-storybook" }, "dependencies": { "${framework}": "1.1.0" } }`,
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
          "sm.json": `{ "framework": "${key}", "apiEndpoint": "https://api.wroom.io/api/v2", "storybook": "localhost:6666" }`,
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

  test("it defaults to vanilla framework if not found in manifest", async () => {
    fs.reset();
    fs.use(
      Volume.fromJSON(
        {
          "sm.json": `{ "apiEndpoint": "https://api.wroom.io/api/v2", "storybook": "localhost:6666" }`,
          "package.json": `{ "scripts": { "storybook": "start-storybook" }, "dependencies": { "unknown": "1.1.0" } }`,
          "nuxt.config.js": `stories: [".slicemachine/assets"]`,
          ".slicemachine/mock-config.json": `{ "field": "value" }`,
        },
        TMP
      )
    );

    const { env } = await getEnv(TMP);
    expect(env.framework).toEqual("vanillajs");
  });
});
