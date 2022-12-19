import fs from "fs";
import { Volume } from "memfs";

import getEnv from "../../../server/src/api/services/getEnv";
import { Models } from "@slicemachine/core";
import { ApplicationMode } from "@slicemachine/client";

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
  const exitSpy = jest.spyOn(process, "exit"); // client may call process.exit(0) and the CI will exit thinking it's a sucess
  const env = { ...process.env };
  afterEach(() => {
    process.env = env;
  });

  test("it throws if no sm.json file is found", () => {
    fs.use(Volume.fromJSON({}, TMP));
    expect(() => {
      getEnv(TMP);
    }).toThrow("Could not find manifest file (./sm.json).");
  });

  test("it throws if no package.json file is found", () => {
    fs.use(
      Volume.fromJSON(
        {
          "sm.json": "{}",
        },
        TMP
      )
    );
    expect(() => {
      getEnv(TMP);
    }).toThrow("Cannot read properties of undefined (reading 'includes')");
  });

  test.skip("it fails because api endpoint is missing", async () => {
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

  test.skip("it fails because api endpoint is invalid 1/2", async () => {
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

  test.skip("it fails because api endpoint is invalid 2/2", async () => {
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
  test("it finds the right framework in package.json", async () => {
    for await (const framework of Models.SupportedFrameworks) {
      fs.reset();
      fs.use(
        Volume.fromJSON(
          {
            "sm.json": JSON.stringify({
              apiEndpoint: "https://api-1.wroom.io/api/v2",
            }),
            "package.json": JSON.stringify({
              scripts: { storybook: "start-storybook" },
              dependencies: { [framework]: "1.1.0" },
            }),
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

  test("it defaults to vanilla framework if not found in manifest", async () => {
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

    const { env } = await getEnv(TMP);
    expect(env.framework).toEqual("vanillajs");
  });

  test("it's application mode should be production", async () => {
    fs.reset();
    fs.use(
      Volume.fromJSON(
        {
          "sm.json": JSON.stringify({
            apiEndpoint: "https://api-1.prismic.io/api/v2",
            framework: "next",
          }),
          "package.json": "{}",
        },
        TMP
      )
    );

    const { env } = await getEnv(TMP);
    expect(env.applicationMode).toEqual(ApplicationMode.PROD);
  });

  test("it's application mode should be staging", async () => {
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

    const { env } = await getEnv(TMP);
    expect(env.applicationMode).toEqual(ApplicationMode.STAGE);
  });

  test("it's application mode should be development", async () => {
    process.env.authentication_server_endpoint = "foo";
    process.env.customtypesapi_endpoint = "foo";
    process.env.user_service_endpoint = "foo";
    process.env.acl_provider_endpoint = "foo";
    process.env.wroom_endpoint = "foo";

    const exitSpy = jest.spyOn(process, "exit").mockImplementation((_) => _);
    fs.reset();
    fs.use(
      Volume.fromJSON(
        {
          "sm.json": JSON.stringify({
            apiEndpoint: "https://api-1.wroom.test/api/v2",
            framework: "next",
          }),
          "package.json": "{}",
        },
        TMP
      )
    );

    const { env } = await getEnv(TMP);
    expect(env.applicationMode).toEqual(ApplicationMode.DEV);
    expect(exitSpy).not.toHaveBeenCalled();
  });

  test("it's application mode should be unknown and it should throw", async () => {
    fs.reset();
    fs.use(
      Volume.fromJSON(
        {
          "sm.json": JSON.stringify({
            apiEndpoint: "https://api-1.fake.io/api/v2",
            framework: "next",
          }),
          "package.json": "{}",
        },
        TMP
      )
    );

    expect(() => {
      getEnv(TMP);
    }).toThrow("Unknown application mode for https://api-1.fake.io/api/v2");
  });
});
