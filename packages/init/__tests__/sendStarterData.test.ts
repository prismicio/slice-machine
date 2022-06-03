import { describe, test, jest, afterEach, expect } from "@jest/globals";
import npath from "path";
import { sendStarterData } from "../src/steps";
import nock from "nock";
import mockfs from "mock-fs";
import os from "os";
import mock from "mock-fs";
import inquirer from "inquirer";

const TMP_DIR = npath.join(os.tmpdir(), "sm-init-starter-test");

const IMAGE_DATA_PATH = npath.join(
  ".slicemachine",
  "assets",
  "slices",
  "MySlice",
  "default",
  "preview.png"
);
const MODEL_PATH = npath.join("slices", "MySlice", "model.json");

describe("send starter data", () => {
  afterEach(() => {
    mock.restore();
  });

  const token = "aaaaaaa";
  const repo = "bbbbbbb";
  const base = "https://prismic.io";
  const cookies = `prismic-auth=${token}`;
  const fakeS3Url = "https://s3.amazonaws.com/prismic-io/";

  test("should send slices and images from the file system to prismic", async () => {
    mockfs({
      [TMP_DIR]: {
        slices: {
          MySlice: {
            "model.json": mockfs.load(
              npath.join(__dirname, "__stubs__", "fake-project", MODEL_PATH)
            ),
            default: {
              "preview.png": mockfs.load(
                npath.join(
                  __dirname,
                  "__stubs__",
                  "fake-project",
                  IMAGE_DATA_PATH
                )
              ),
            },
          },
        },
        "sm.json": JSON.stringify({
          apiEndpoint: "https://foo-bar.prismic.io/api/v2",
          libraries: ["@/slices"],
          framework: "none",
        }),
      },
    });

    const smApi = nock("https://customtypes.prismic.io", {
      reqheaders: {
        repository: repo,
        Authorization: `Bearer ${token}`,
      },
    });

    smApi.get("/slices").reply(200, []);

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
        if (body.variations.length === 0) return false;
        return imageUrlRegexp.test(body.variations[0].imageUrl);
      })
      .reply(200);

    const result = await sendStarterData(repo, base, cookies, TMP_DIR);
    expect(result).toBeTruthy();
  });

  test("it should warn the user if they have remote slices", async () => {
    mockfs({
      [TMP_DIR]: {
        "sm.json": JSON.stringify({
          apiEndpoint: "https://foo-bar.wroom.io/api/v2",
          libraries: ["@/slices"],
          framework: "none",
        }),
      },
    });

    const smApi = nock("https://customtypes.prismic.io", {
      reqheaders: {
        repository: repo,
        Authorization: `Bearer ${token}`,
      },
    });

    smApi.get("/slices").reply(200, [{}]);

    const promptSpy = jest
      .spyOn(inquirer, "prompt")
      .mockResolvedValue({ pushSlices: false });

    const result = await sendStarterData(repo, base, cookies, TMP_DIR);
    expect(promptSpy).toHaveBeenCalled();
    expect(result).toBeTruthy();
  });

  test("it should do nothing when there is no sm.json", async () => {
    mockfs({
      [TMP_DIR]: {},
    });

    const result = await sendStarterData(repo, base, cookies, TMP_DIR);
    expect(result).toBeFalsy();
  });

  test("when run in a partially setup repo (from init) it should do nothing", async () => {
    mockfs({
      [TMP_DIR]: {
        "sm.json": JSON.stringify({
          apiEndpoint: "https://foo-bar.prismic.io/api/v2",
          libraries: ["@/slices"],
          framework: "none",
        }),
      },
    });

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

    const smApi = nock("https://customtypes.prismic.io", {
      reqheaders: {
        repository: repo,
        Authorization: `Bearer ${token}`,
      },
    });

    smApi.get("/slices").reply(200, []);

    const result = await sendStarterData(repo, base, cookies, TMP_DIR);
    expect(result).toBeTruthy();
  });

  test("it can send slices and images to wroom.io", async () => {
    mockfs({
      [TMP_DIR]: {
        slices: {
          MySlice: {
            "model.json": mockfs.load(
              npath.join(__dirname, "__stubs__", "fake-project", MODEL_PATH)
            ),
            default: {
              "preview.png": mockfs.load(
                npath.join(
                  __dirname,
                  "__stubs__",
                  "fake-project",
                  IMAGE_DATA_PATH
                )
              ),
            },
          },
        },
        "sm.json": JSON.stringify({
          apiEndpoint: "https://foo-bar.wroom.io/api/v2",
          libraries: ["@/slices"],
          framework: "none",
        }),
      },
    });

    const smApi = nock("https://customtypes.wroom.io", {
      reqheaders: {
        repository: repo,
        Authorization: `Bearer ${token}`,
      },
    });

    smApi.get("/slices").reply(200, []);

    const fakeS3Url = "https://s3.amazonaws.com/wroom-io/";

    // Mock ACL
    nock("https://2iamcvnxf4.execute-api.us-east-1.amazonaws.com/", {
      reqheaders: {
        repository: repo,
        Authorization: `Bearer ${token}`,
        "User-Agent": "slice-machine",
      },
    })
      .get("/stage/create")
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
        imgixEndpoint: "https://images.wroom.io",
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
      /https:\/\/images.wroom.io\/bbbbbbb\/shared-slices\/my_slice\/default-[0-9a-z]+\/preview.png/;

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

    const result = await sendStarterData(
      repo,
      "https://wroom.io",
      cookies,
      TMP_DIR
    );
    expect(result).toBeTruthy();
  });
});
