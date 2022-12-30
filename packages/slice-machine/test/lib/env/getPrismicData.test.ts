import { describe, test, expect, vi } from "vitest";
import getPrismicData from "../../../lib/env/getPrismicData";
// import { vol } from "memfs";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

vi.mock("fs", async () => {
  const memfs: typeof import("memfs") = await vi.importActual("memfs");

  return {
    ...memfs.fs,
    default: memfs.fs,
  };
});

vi.mock("fs/promises", async () => {
  const memfs: typeof import("memfs") = await vi.importActual("memfs");

  return {
    ...memfs.fs.promises,
    default: memfs.fs.promises,
  };
});

// vi.mock(`fs`, async () => {
//   const { vol } = await vi.importActual("memfs");
//
//   return vol;
// });
describe("getPrismicData", () => {
  // afterEach(() => {
  //   vol.reset();
  // });

  test.only("it should return the data from ~/.prismic", async () => {
    const base = "https://example.com";
    const cookies = "prismic-auth=biscuits";

    await fs.writeFile(
      path.join(os.homedir(), ".prismic"),
      JSON.stringify({ base, cookies })
    );

    const result = getPrismicData();
    expect(result.isOk()).toBeTruthy();
    expect(result.isOk() && result.value.auth).toEqual("biscuits");
  });

  test("should return cookies as undefinde when there is no cookie", async () => {
    const base = "https://prismic.io";

    await fs.writeFile(
      path.join(os.homedir(), ".prismic"),
      JSON.stringify({ base, cookies: "" })
    );

    const result = getPrismicData();
    expect(result.isOk()).toBeTruthy();
    expect(result.isOk() && result.value.auth).toBeUndefined();
  });

  test("error case?", async () => {
    const base = "https://prismic.io";

    await fs.writeFile(
      path.join(os.homedir(), ".prismic"),
      JSON.stringify({ base, cookies: "+" })
    );

    // vi.spyOn(fs, "readFileSync").mockImplementation(() => {
    //   throw new Error("whoops");
    // });
    // vi.spyOn(fs, "writeFileSync").mockImplementation(() => {
    //   throw new Error("whoops");
    // });

    const result = getPrismicData();
    expect(result.isOk()).toBeTruthy();
    expect(result.isOk() && result.value.shortId).toBeUndefined();
  });
});
