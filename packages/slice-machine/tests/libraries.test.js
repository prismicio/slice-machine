const TMP = "/tmp";
import fs from "fs";
import { Volume } from "memfs";

import { getEnv } from "../lib/env";
import { listComponentsByLibrary } from "../lib/queries/listComponents";

jest.mock(`fs`, () => {
  const fs = jest.requireActual(`fs`);
  const unionfs = require(`unionfs`).default;
  unionfs.reset = () => {
    unionfs.fss = [fs];
  };
  return unionfs.use(fs);
});

afterEach(() => {
  fs.reset();
});

const commonExpect = async (env, prefix, libName, href) => {
  const libraries = await listComponentsByLibrary(env);
  expect(env.userConfig.libraries).toEqual([`${prefix}${libName}`]);

  expect(libraries.length).toEqual(1);
  expect(libraries[0].isLocal).toEqual(true);
  expect(libraries[0].name).toEqual(libName);
  expect(libraries[0].components.length).toEqual(1);
  const [component] = libraries[0].components;

  expect(component.from).toEqual(libName);
  expect(component.href).toEqual(href || libName);
  expect(component.pathToSlice).toEqual(`./${libName}`);

  expect(component.infos.sliceName).toEqual("CallToAction");
  expect(component.infos.isDirectory).toEqual(true);

  expect(component.migrated).toEqual(false);
  return libraries;
};

test("it gets library info from @ path 1/2", async () => {
  const libName = "slices";
  const prefix = "@/";
  fs.use(
    Volume.fromJSON(
      {
        "sm.json": `{ "apiEndpoint": "http://api.prismic.io/api/v2", "libraries": ["${prefix}${libName}"] }`,
        "package.json": "{}",
        "slices/CallToAction/model.json": "{}",
      },
      TMP
    )
  );

  const { env } = await getEnv(TMP);
  await commonExpect(env, prefix, libName);
});

test("it gets library info from @ path 2/2", async () => {
  const libName = "slices";
  const prefix = "@/";
  fs.use(
    Volume.fromJSON(
      {
        "sm.json": `{ "apiEndpoint": "http://api.prismic.io/api/v2", "libraries": ["${prefix}${libName}"] }`,
        "package.json": "{}",
        "slices/CallToAction/model.json": "{}",
        "slices/CallToAction/index.svelte": "const a = 1",
      },
      TMP
    )
  );

  const { env } = await getEnv(TMP);
  const libraries = await commonExpect(env, prefix, libName);
  const [component] = libraries[0].components;
  expect(component.infos.fileName).toEqual("index");
  expect(component.infos.extension).toEqual("svelte");
});

test("it gets library info from ~ path", async () => {
  const libName = "slices";
  const prefix = "~/";
  fs.use(
    Volume.fromJSON(
      {
        "sm.json": `{ "apiEndpoint": "http://api.prismic.io/api/v2", "libraries": ["${prefix}${libName}"] }`,
        "package.json": "{}",
        "slices/CallToAction/model.json": "{}",
      },
      TMP
    )
  );

  const { env } = await getEnv(TMP);
  await commonExpect(env, prefix, libName);
});

test("it gets library info from / path", async () => {
  const libName = "slices";
  const prefix = "/";
  fs.use(
    Volume.fromJSON(
      {
        "sm.json": `{ "apiEndpoint": "http://api.prismic.io/api/v2", "libraries": ["${prefix}${libName}"] }`,
        "package.json": "{}",
        "slices/CallToAction/model.json": "{}",
      },
      TMP
    )
  );

  const { env } = await getEnv(TMP);
  await commonExpect(env, prefix, libName);
});

test("it ignores non slice folders", async () => {
  const libName = "~/slices";
  fs.use(
    Volume.fromJSON(
      {
        "sm.json": `{ "apiEndpoint": "http://api.prismic.io/api/v2", "libraries": ["${libName}"] }`,
        "package.json": "{}",
        "slices/CallToAction1/model.json": "{}",
        "slices/CallToAction/something.else": "const a = 'a'",
      },
      TMP
    )
  );

  const { env } = await getEnv(TMP);
  const libraries = await listComponentsByLibrary(env);
  expect(libraries[0].components.length).toEqual(1);
});

test("it handles nested library info", async () => {
  const libName = "slices/src/slices";
  const prefix = "~/";
  fs.use(
    Volume.fromJSON(
      {
        "sm.json": `{ "apiEndpoint": "http://api.prismic.io/api/v2", "libraries": ["${prefix}${libName}"] }`,
        "package.json": "{}",
        "slices/src/slices/CallToAction/model.json": "{}",
      },
      TMP
    )
  );

  const { env } = await getEnv(TMP);
  await commonExpect(env, prefix, libName, "slices--src--slices");
});

test("it finds non local libs", async () => {
  const libName = "vue-essential-slices";
  const pathToSlice = `node_modules/${libName}/slices/CallToAction/model.json`;
  fs.use(
    Volume.fromJSON(
      {
        "sm.json": `{ "apiEndpoint": "http://api.prismic.io/api/v2", "libraries": ["${libName}"] }`,
        "package.json": "{}",
        [pathToSlice]: "{}",
      },
      TMP
    )
  );

  const { env } = await getEnv(TMP);
  expect(env.userConfig.libraries).toEqual([libName]);
  const libraries = await listComponentsByLibrary(env);
  expect(libraries[0].isLocal).toEqual(false);
  expect(libraries[0].components[0].pathToSlice).toEqual(`${libName}/slices`);
});

test("it rejects invalid JSON models", async () => {
  const libName = "vue-essential-slices";
  const pathToSlice = (slice) =>
    `node_modules/${libName}/slices/${slice}/model.json`;
  fs.use(
    Volume.fromJSON(
      {
        "sm.json": `{ "apiEndpoint": "http://api.prismic.io/api/v2", "libraries": ["${libName}"] }`,
        "package.json": "{}",
        [pathToSlice("CallToAction")]: "const invalid = true",
        [pathToSlice("CallToAction2")]: "{}",
      },
      TMP
    )
  );

  const { env } = await getEnv(TMP);
  expect(env.userConfig.libraries).toEqual([libName]);
  const libraries = await listComponentsByLibrary(env);
  expect(libraries[0].isLocal).toEqual(false);
  expect(libraries[0].components.length).toEqual(1);
});

test("it filters non existing libs", async () => {
  const libName = "vue-essential-slices";
  fs.use(
    Volume.fromJSON(
      {
        "sm.json": `{ "apiEndpoint": "http://api.prismic.io/api/v2", "libraries": ["${libName}"] }`,
        "package.json": "{}",
      },
      TMP
    )
  );

  const { env } = await getEnv(TMP);
  expect(env.userConfig.libraries).toEqual([libName]);
  const libraries = await listComponentsByLibrary(env);
  expect(libraries).toEqual([]);
});
