import getPrismicData from "../../../server/src/api/services/getPrismicData";
import { vol } from "memfs";
import os from "os";
import fs from "fs";

jest.mock(`fs`, () => {
  const { vol } = jest.requireActual("memfs");
  return vol;
});
describe("getPrismicData", () => {
  afterEach(() => {
    vol.reset();
  });

  test("it should return the data from ~/.prismic", () => {
    const base = "https://example.com";
    const cookies = "prismic-auth=biscuits";
    vol.fromJSON(
      {
        ".prismic": JSON.stringify({ base, cookies }),
      },
      os.homedir()
    );

    const result = getPrismicData();
    expect(result.isOk()).toBeTruthy();
    expect(result.isOk() && result.value.auth).toEqual("biscuits");
  });

  test("should return cookies as undefinde when there is no cookie", () => {
    const base = "https://prismic.io";
    vol.fromJSON(
      {
        ".prismic": JSON.stringify({ base, cookies: "" }),
      },
      os.homedir()
    );
    const result = getPrismicData();
    expect(result.isOk()).toBeTruthy();
    expect(result.isOk() && result.value.auth).toBeUndefined();
  });

  test("error case?", async () => {
    const base = "https://prismic.io";
    vol.fromJSON(
      {
        ".prismic": JSON.stringify({ base, cookies: "+" }),
      },
      os.homedir()
    );

    jest.spyOn(fs, "readFileSync").mockImplementation(() => {
      throw new Error("whoops");
    });
    jest.spyOn(fs, "writeFileSync").mockImplementation(() => {
      throw new Error("whoops");
    });

    const result = await getPrismicData();
    expect(result.isOk()).toBeTruthy();
    expect(result.isOk() && result.value.shortId).toBeUndefined();
  });
});
