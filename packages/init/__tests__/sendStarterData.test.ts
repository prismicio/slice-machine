import { describe, test, jest, afterEach, expect } from "@jest/globals";

import npath from "path";
import { sendStarterData } from "../src/steps";

import nock from "nock";
import fs from "fs";
import { vol } from "memfs";
import os from "os";

const nfs = jest.requireActual("fs") as typeof fs;
const TMP_DIR = npath.join(os.tmpdir(), "sm-init-starter-test");
const PROJECT_DIR = npath.join(
  npath.join(__dirname, "__stubs__", "fake-project")
);
const IMAGE_DATA_PATH = npath.join(
  ".slicemachine",
  "assets",
  "slices",
  "MySlice",
  "default",
  "preview.png"
);
const MODEL_PATH = npath.join("slices", "MySlice", "model.json");
const IMAGE_DATA = nfs.readFileSync(
  npath.join(PROJECT_DIR, IMAGE_DATA_PATH),
  "utf-8"
);
const MODEL_DATA = nfs.readFileSync(
  npath.join(PROJECT_DIR, MODEL_PATH),
  "utf-8"
);
const SM_DATA = nfs.readFileSync(npath.join(PROJECT_DIR, "sm.json"), "utf-8");

describe("send starter data", () => {
  jest.mock("fs", () => {
    return vol;
  });

  afterEach(() => {
    vol.reset();
  });

  const token = "aaaaaaa";
  const repo = "bbbbbbb";
  const base = "https://prismic.io";
  const cookies = `prismic-auth=${token}`;

  test("should send slices and images from the file system to prismic", async () => {
    vol.fromJSON(
      {
        [IMAGE_DATA_PATH]: IMAGE_DATA,
        [MODEL_PATH]: MODEL_DATA,
        "sm.json": SM_DATA,
      },
      TMP_DIR
    );

    const smApi = nock("https://customtypes.prismic.io", {
      reqheaders: {
        repository: repo,
        Authorization: `Bearer ${token}`,
      },
    });

    smApi.get("/slices").reply(200, []);

    const fakeS3Url = "https://s3.amazonaws.com/prismic-io/";

    // Mock ACL
    nock("https://0yyeb2g040.execute-api.us-east-1.amazonaws.com", {
      reqheaders: {
        repository: repo,
        Authorization: `Bearer ${token}`,
        "User-Agent": "slice-machine",
      },
    })
      .get("/prod/create")
      .reply(200, {
        values: {
          url: fakeS3Url,
          fields: {
            acl: "public-read",
            "Content-Disposition": "inline",
            bucket: "prismic-io",
            "X-Amz-Algorithm": "a",
            "X-Amz-Credential": "a",
            "X-Amz-Date": "a",
            Policy: "a",
            "X-Amz-Signature": "a",
          },
        },
        imgixEndpoint: "https://images.prismic.io",
        err: null,
      });

    // Mock S3
    nock(fakeS3Url)
      .post("/", (body) => {
        if (!body) return false;
        if (typeof body !== "string") return false;
        const text = Buffer.from(body, "hex").toString();
        const keyRegExp =
          /form-data; name="key"[^]*[\w\d]+\/shared-slices\/my_slice\/default-[0-9a-z]+\/preview\.png/gm;
        const hasKey = keyRegExp.test(text);
        const fileRegexp = /form-data; name="file"; filename="preview.png"/;
        const hasFile = fileRegexp.test(text);
        return hasKey && hasFile;
      })
      .reply(204);

    const imageUrlRegexp =
      /https:\/\/images.prismic.io\/bbbbbbb\/shared-slices\/my_slice\/default-[0-9a-z]+\/preview.png/;

    type Body = {
      variations: Array<{ imageUrl: string }>;
    };

    smApi
      .post("/slices/insert", (d) => {
        const body = d as unknown as Body;
        if (!body) return false;
        if (typeof body !== "object") return false;
        if ("variations" in body === false) return false;
        if (Array.isArray(body.variations) === false) return false;
        return (
          (body &&
            body.variations &&
            body.variations.length &&
            imageUrlRegexp.test(body.variations[0].imageUrl)) ||
          false
        );
      })
      .reply(200);

    await sendStarterData(repo, base, cookies, TMP_DIR);
  });

  test("it should warn the user if they have remote slices", async () => {
    vol.fromJSON({}, TMP_DIR);

    const smApi = nock("https://customtypes.prismic.io", {
      reqheaders: {
        repository: repo,
        Authorization: `Bearer ${token}`,
      },
    });

    smApi.get("/slices").reply(200, [{}]);

    const warnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    const result = await sendStarterData(repo, base, cookies, TMP_DIR);
    expect(warnSpy).toHaveBeenCalledWith("Slices Found Do Something");
    expect(result).toBeUndefined();
  });

  test("it should do nothin when there is no sm.json", async () => {
    vol.fromJSON({}, TMP_DIR);

    const smApi = nock("https://customtypes.prismic.io", {
      reqheaders: {
        repository: repo,
        Authorization: `Bearer ${token}`,
      },
    });

    smApi.get("/slices").reply(200, []);

    const result = await sendStarterData(repo, base, cookies, TMP_DIR);
    expect(result).toBeUndefined();
  });

  test("when run in a partially setup repo (from init) it should do nothing", async () => {
    vol.fromJSON(
      {
        "sm.json": JSON.stringify({
          apiEndpoint: "https://foo-bar.prismic.io/api/v2",
          libraries: ["~/slices"],
        }),
      },
      TMP_DIR
    );

    const smApi = nock("https://customtypes.prismic.io", {
      reqheaders: {
        repository: repo,
        Authorization: `Bearer ${token}`,
      },
    });

    smApi.get("/slices").reply(200, []);

    const result = await sendStarterData(repo, base, cookies, TMP_DIR);
    expect(result).toBeUndefined();
  });
});
