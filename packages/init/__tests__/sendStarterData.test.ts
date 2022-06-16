import { describe, test, jest, afterEach, expect } from "@jest/globals";
import npath from "path";
import { sendStarterData } from "../src/steps";
import nock from "nock";
import mockfs from "mock-fs";
import os from "os";
import mock from "mock-fs";
import inquirer from "inquirer";
import { stderr } from "stdout-stderr";

import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { isLeft } from "fp-ts/lib/Either";
import { InitClient } from "../src/utils";
import { ApplicationMode } from "@slicemachine/client";
import SliceJson from "./__stubs__/fake-project/slices/MySlice/model.json";

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

const token = "aaaaaaa";
const repo = "bbbbbbb";
const fakeS3Url = "https://s3.amazonaws.com/prismic-io/";

function validateS3Body(body: unknown) {
  if (!body) return false;
  if (typeof body !== "string") return false;
  const text = Buffer.from(body, "hex").toString();
  const keyRegExp =
    /form-data; name="key"[^]*[\w\d]+\/shared-slices\/my_slice\/default-[0-9a-z]+\/preview\.png/gm;
  const hasKey = keyRegExp.test(text);
  const fileRegexp = /form-data; name="file"; filename="preview.png"/;
  const hasFile = fileRegexp.test(text);
  return hasKey && hasFile;
}

const clientProd = new InitClient(ApplicationMode.PROD, repo, token);
const clientStage = new InitClient(ApplicationMode.STAGE, repo, token);

describe("send starter data", () => {
  afterEach(() => {
    mock.restore();
  });

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
        documents: {},
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
    nock(fakeS3Url).post("/", validateS3Body).reply(204);

    const imageUrlRegexp =
      /https:\/\/images.prismic.io\/bbbbbbb\/shared-slices\/my_slice\/default-[0-9a-z]+\/preview.png/;

    smApi
      .post("/slices/insert", (d) => {
        const body = SharedSlice.decode(d);
        if (isLeft(body)) return false;
        if (body.right.variations.length === 0) return false;
        return imageUrlRegexp.test(body.right.variations[0].imageUrl);
      })
      .reply(200);

    stderr.start();
    const result = await sendStarterData(clientProd, TMP_DIR);
    stderr.stop();
    expect(result).toBeTruthy();
  });

  test("it should warn the user if they have remote slices", async () => {
    mockfs({
      [TMP_DIR]: {
        documents: {},
        "sm.json": JSON.stringify({
          apiEndpoint: "https://foo-bar.prismic.io/api/v2",
          libraries: ["@/slices"],
          framework: "none",
        }),
        slices: {
          MySlice: {
            "model.json": JSON.stringify(SliceJson),
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
      },
    });

    const smApi = nock("https://customtypes.prismic.io", {
      reqheaders: {
        repository: repo,
        Authorization: `Bearer ${token}`,
      },
    });

    smApi.get("/slices").reply(200, [SliceJson]);

    const promptSpy = jest
      .spyOn(inquirer, "prompt")
      .mockResolvedValue({ pushSlices: false });

    stderr.start();
    const result = await sendStarterData(clientProd, TMP_DIR);
    stderr.stop();

    expect(promptSpy).toHaveBeenCalled();
    expect(result).toBeTruthy();
  });

  test("it should do nothing when there is no documents directory", async () => {
    mockfs({
      [TMP_DIR]: {},
    });

    const result = await sendStarterData(clientProd, TMP_DIR);
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

    stderr.start();
    const result = await sendStarterData(clientProd, TMP_DIR);
    stderr.stop();

    expect(result).toBeFalsy();
  });

  test("it can send slices and images to wroom.io", async () => {
    mockfs({
      [TMP_DIR]: {
        documents: {},
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
    nock(fakeS3Url).post("/", validateS3Body).reply(204);

    const imageUrlRegexp =
      /https:\/\/images.wroom.io\/bbbbbbb\/shared-slices\/my_slice\/default-[0-9a-z]+\/preview.png/;

    smApi
      .post("/slices/insert", (d) => {
        const body = SharedSlice.decode(d);
        if (isLeft(body)) return false;
        if (body.right.variations.length === 0) return false;
        return imageUrlRegexp.test(body.right.variations[0].imageUrl);
      })
      .reply(200);

    stderr.start();

    const result = await sendStarterData(clientStage, TMP_DIR);

    stderr.stop();

    expect(result).toBeTruthy();
  });

  test("when the remote slice exists it should call the update endpoint", async () => {
    mockfs({
      [TMP_DIR]: {
        documents: {},
        slices: {
          MySlice: {
            "model.json": JSON.stringify(SliceJson),
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

    smApi.get("/slices").reply(200, [SliceJson]);

    jest.spyOn(inquirer, "prompt").mockResolvedValue({ pushSlices: true });

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
    nock(fakeS3Url).post("/", validateS3Body).reply(204);

    const imageUrlRegexp =
      /https:\/\/images.wroom.io\/bbbbbbb\/shared-slices\/my_slice\/default-[0-9a-z]+\/preview.png/;

    smApi
      .post("/slices/update", (d) => {
        const body = SharedSlice.decode(d);
        if (isLeft(body)) return false;
        if (body.right.variations.length === 0) return false;
        return imageUrlRegexp.test(body.right.variations[0].imageUrl);
      })
      .reply(200);

    stderr.start();

    const result = await sendStarterData(clientStage, TMP_DIR);

    stderr.stop();
    expect(result).toBeTruthy();
  });
});
