import { describe, test, expect, vi } from "vitest";
import getPrismicData from "../../../lib/env/getPrismicData";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import os from "node:os";

describe("getPrismicData", () => {
  test("it should return the data from ~/.prismic", async () => {
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

    vi.spyOn(fsSync, "readFileSync").mockImplementation(() => {
      throw new Error("whoops");
    });
    vi.spyOn(fsSync, "writeFileSync").mockImplementation(() => {
      throw new Error("whoops");
    });

    const result = getPrismicData();
    expect(result.isOk()).toBeTruthy();
    expect(result.isOk() && result.value.shortId).toBeUndefined();
  });
});
