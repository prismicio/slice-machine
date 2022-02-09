import getPrismicData from "../../../server/src/api/services/getPrismicData";
import { vol } from "memfs";
import os from "os";
import fs from "fs";

jest.mock(`fs`, () => {
  //@ts-ignore
  const { vol } = jest.requireActual("memfs");
  return vol;
});
describe("getPrismicData", () => {
  afterEach(() => {
    vol.reset();
  });

  test("it should set return the data from ~/.prismic", async () => {
    const base = "https://example.com";
    const cookies = "prismic-auth=biscuits";
    vol.fromJSON(
      {
        ".prismic": JSON.stringify({ base, cookies }),
      },
      os.homedir()
    );

    const result = await getPrismicData(base);
    expect(result.isOk()).toBeTruthy();
    expect(result.isOk() && result.value.base).toEqual(base);
    expect(result.isOk() && result.value.auth).toEqual("biscuits");
  });

  test("if the argument is diffrent from the base in ~/.prismic it will set it", async () => {
    const base = "https://wroom.io";
    const cookies = "prismic-auth=biscuits";
    vol.fromJSON(
      {
        ".prismic": JSON.stringify({ base: "https://prismic.io", cookies }),
      },
      os.homedir()
    );

    jest.spyOn(fs, "writeFileSync");

    const result = await getPrismicData(base);
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(result.isOk()).toBeTruthy();
    expect(result.isOk() && result.value.base).toEqual(base);
    expect(result.isOk() && result.value.auth).toBeUndefined();
  });

  test("no cookie", async () => {
    const base = "https://prismic.io";
    vol.fromJSON(
      {
        ".prismic": JSON.stringify({ base, cookies: "" }),
      },
      os.homedir()
    );
    const result = await getPrismicData(base);
    expect(result.isOk()).toBeTruthy();
    expect(result.isOk() && result.value.base).toEqual(base);
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

    const result = await getPrismicData(base);
    expect(result.isOk()).toBeTruthy();
    expect(result.isOk() && result.value.shortId).toBeUndefined();
  });
});
