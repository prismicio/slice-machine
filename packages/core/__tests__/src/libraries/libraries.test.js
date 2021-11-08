const TMP = "/tmp";
import fs from "fs";
import { Volume } from "memfs";

import { libraries } from "../../../src/libraries"

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

const commonExpect = async (cwd, configLibs, libName, href) => {
  const result = await libraries(cwd, configLibs);

  expect(result.length).toEqual(1);
  expect(result[0].isLocal).toEqual(true);
  expect(result[0].name).toEqual(libName);
  expect(result[0].components.length).toEqual(1);
  const [component] = result[0].components;

  expect(component.from).toEqual(libName);
  expect(component.href).toEqual(href || libName);
  expect(component.pathToSlice).toEqual(`./${libName}`);

  expect(component.infos.sliceName).toEqual("CallToAction");
  expect(component.infos.isDirectory).toEqual(true);

  expect(component.migrated).toEqual(false);
  return result;
};

const testPrefix = async (prefix) => {
  const libName = "slices";
  fs.use(
    Volume.fromJSON(
      {
        "slices/CallToAction/model.json": "{}",
        "slices/CallToAction/index.svelte": "const a = 1",
      },
      TMP
    )
  );

  const libs = [`${prefix}${libName}`]
  const result = await commonExpect(TMP, libs, libName);
  const [component] = result[0].components;
  expect(component.infos.fileName).toEqual("index");
  expect(component.infos.extension).toEqual("svelte");
}

test("it finds slice in local library", async () => {
  const libName = "slices";
  const prefix = "@/";
  fs.use(
    Volume.fromJSON(
      {
        "slices/CallToAction/model.json": "{}",
      },
      TMP
    )
  );

  const libs = [`${prefix}${libName}`]
  await commonExpect(TMP, libs, libName);
});

test("it finds slice component in local library", async () => {
  await testPrefix("@/")
});

test("it finds slice component in ~ library", async () => {
  await testPrefix("~/")
});

test("it finds slice component in / library", async () => {
  await testPrefix("/")
});


test("it ignores non slice folders", async () => {
  const libName = "~/slices";
  fs.use(
    Volume.fromJSON(
      {
        "slices/NonSlice/ex.json": "{}",
        "slices/CallToAction1/model.json": "{}",
        "slices/CallToAction/something.else": "const a = 'a'",
      },
      TMP
    )
  );

  const result = await libraries(TMP, [libName])
  expect(result[0].components.length).toEqual(1);
});

test("it handles nested library info", async () => {
  const libName = "slices/src/slices";
  fs.use(
    Volume.fromJSON(
      {
        "slices/src/slices/CallToAction/model.json": "{}",
      },
      TMP
    )
  );
  await commonExpect(TMP, ["~/slices/src/slices"], libName, "slices--src--slices");
});

test("it finds non local libs", async () => {
  const libName = "vue-essential-slices";
  const pathToSlice = `node_modules/${libName}/slices/CallToAction/model.json`;
  fs.use(
    Volume.fromJSON(
      {
        "package.json": "{}",
        [pathToSlice]: "{}",
      },
      TMP
    )
  );

  const result = await libraries(TMP, [libName]);
  expect(result[0].isLocal).toEqual(false);
  expect(result[0].components[0].pathToSlice).toEqual(`${libName}/slices`);
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

  const result = await libraries(TMP, [libName]);
  expect(result[0].isLocal).toEqual(false);
  expect(result[0].components.length).toEqual(1);
});

test("it filters non existing libs", async () => {
  fs.use(
    Volume.fromJSON(
      {
        "package.json": "{}",
      },
      TMP
    )
  );

  const result = await libraries(TMP, ["vue-essential-slices"]);
  expect(result).toEqual([]);
});
