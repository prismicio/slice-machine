import { describe, test, jest, afterEach, expect } from "@jest/globals";
import npath from "path";
import { sendSlicesFromStarter } from "../../src/steps/starters/slices";

import nock from "nock";
import mockfs from "mock-fs";
import os from "os";
import mock from "mock-fs";
import inquirer from "inquirer";
// import { stderr } from "stdout-stderr";

import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import {
  isLeft,
  // isRight
} from "fp-ts/lib/Either";
import { stderr } from "stdout-stderr";
// import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
// import { CustomType } from "@prismicio/types-internal/lib/customtypes";
// import _ from "lodash";

const TMP_DIR = npath.join(os.tmpdir(), "sm-init-starter-test");
const PATH_TO_STUB_PROJECT = npath.join(
  __dirname,
  "..",
  "__stubs__",
  "fake-project"
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

const token = "aaaaaaa";
const repo = "bbbbbbb";
const base = "https://prismic.io";
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

describe("sendSlicesFromStarter", () => {
  afterEach(() => {
    mock.restore();
    nock.cleanAll();
  });

  test("should send slices and images from the file system to prismic", async () => {
    const smJson = {
      apiEndpoint: "https://foo-bar.prismic.io/api/v2",
      libraries: ["@/slices"],
      framework: "none",
    };
    mockfs({
      [TMP_DIR]: {
        slices: {
          MySlice: {
            "model.json": mockfs.load(
              npath.join(PATH_TO_STUB_PROJECT, MODEL_PATH)
            ),
            default: {
              "preview.png": mockfs.load(
                npath.join(PATH_TO_STUB_PROJECT, IMAGE_DATA_PATH)
              ),
            },
          },
        },
        "sm.json": JSON.stringify(smJson),
      },
    });

    const smApi = nock("https://customtypes.prismic.io")
      .matchHeader("repository", repo)
      .matchHeader("Authorization", `Bearer ${token}`);

    smApi.get("/slices").reply(200, []);

    // Mock ACL
    nock("https://0yyeb2g040.execute-api.us-east-1.amazonaws.com")
      .get("/prod/create")
      .matchHeader("User-Agent", "slice-machine")
      .matchHeader("Authorization", `Bearer ${token}`)
      .matchHeader("repository", repo)
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
    const result = await sendSlicesFromStarter(
      base,
      repo,
      token,
      smJson.libraries,
      TMP_DIR
    );
    stderr.stop();

    expect(stderr.output).toContain(
      "Pushing existing Slice models to your repository"
    );

    expect(result).toBeTruthy();
  });

  test("it should warn the user if they have remote slices", async () => {
    const smJson = {
      apiEndpoint: "https://foo-bar.wroom.io/api/v2",
      libraries: ["@/slices"],
      framework: "none",
    };
    mockfs({
      [TMP_DIR]: {
        "sm.json": JSON.stringify(smJson),
        slices: {
          MySlice: {
            "model.json": mockfs.load(
              npath.join(PATH_TO_STUB_PROJECT, MODEL_PATH)
            ),
            default: {
              "preview.png": mockfs.load(
                npath.join(PATH_TO_STUB_PROJECT, IMAGE_DATA_PATH)
              ),
            },
          },
        },
      },
    });

    const smApi = nock("https://customtypes.prismic.io")
      .matchHeader("repository", repo)
      .matchHeader("Authorization", `Bearer ${token}`);

    smApi.get("/slices").reply(200, [{}]);

    const promptSpy = jest
      .spyOn(inquirer, "prompt")
      .mockResolvedValue({ pushSlices: false });

    const result = await sendSlicesFromStarter(
      base,
      repo,
      token,
      smJson.libraries,
      TMP_DIR
    );

    expect(promptSpy).toHaveBeenCalled();
    expect(result).toBeTruthy();
  });

  test("when run in a partially setup repo (from init) it should do nothing", async () => {
    const smJson = {
      apiEndpoint: "https://foo-bar.prismic.io/api/v2",
      libraries: ["@/slices"],
      framework: "none",
    };

    mockfs({
      [TMP_DIR]: {
        "sm.json": JSON.stringify(smJson),
      },
    });

    const result = await sendSlicesFromStarter(
      base,
      repo,
      token,
      smJson.libraries,
      TMP_DIR
    );

    expect(result).toBeFalsy();
  });

  test("it can send slices and images to wroom.io", async () => {
    const smJson = {
      apiEndpoint: "https://foo-bar.wroom.io/api/v2",
      libraries: ["@/slices"],
      framework: "none",
    };

    mockfs({
      [TMP_DIR]: {
        slices: {
          MySlice: {
            "model.json": mockfs.load(
              npath.join(PATH_TO_STUB_PROJECT, MODEL_PATH)
            ),
            default: {
              "preview.png": mockfs.load(
                npath.join(PATH_TO_STUB_PROJECT, IMAGE_DATA_PATH)
              ),
            },
          },
        },
        "sm.json": JSON.stringify(smJson),
      },
    });

    const smApi = nock("https://customtypes.wroom.io")
      .matchHeader("repository", repo)
      .matchHeader("Authorization", `Bearer ${token}`);

    smApi.get("/slices").reply(200, []);

    const fakeS3Url = "https://s3.amazonaws.com/wroom-io/";

    // Mock ACL
    nock("https://2iamcvnxf4.execute-api.us-east-1.amazonaws.com/")
      .matchHeader("repository", repo)
      .matchHeader("Authorization", `Bearer ${token}`)
      .matchHeader("User-Agent", "slice-machine")
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
    const result = await sendSlicesFromStarter(
      "https://wroom.io",
      repo,
      token,
      smJson.libraries,
      TMP_DIR
    );
    stderr.stop();

    expect(stderr.output).toContain(
      "Pushing existing Slice models to your repository"
    );

    expect(result).toBeTruthy();
  });

  test("when the remote slice exists it should call the update endpoint", async () => {
    const smJson = {
      apiEndpoint: "https://foo-bar.wroom.io/api/v2",
      libraries: ["@/slices"],
      framework: "none",
    };
    mockfs({
      [TMP_DIR]: {
        slices: {
          MySlice: {
            "model.json": mockfs.load(
              npath.join(PATH_TO_STUB_PROJECT, MODEL_PATH)
            ),
            default: {
              "preview.png": mockfs.load(
                npath.join(PATH_TO_STUB_PROJECT, IMAGE_DATA_PATH)
              ),
            },
          },
        },
        "sm.json": JSON.stringify(smJson),
      },
    });

    const smApi = nock("https://customtypes.wroom.io")
      .matchHeader("repository", repo)
      .matchHeader("Authorization", `Bearer ${token}`);

    smApi.get("/slices").reply(200, [{ id: "my_slice" }]);

    jest.spyOn(inquirer, "prompt").mockResolvedValue({ pushSlices: true });

    const fakeS3Url = "https://s3.amazonaws.com/wroom-io/";

    // Mock ACL
    nock("https://2iamcvnxf4.execute-api.us-east-1.amazonaws.com/")
      .matchHeader("repository", repo)
      .matchHeader("Authorization", `Bearer ${token}`)
      .matchHeader("User-Agent", "slice-machine")
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
    const result = await sendSlicesFromStarter(
      "https://wroom.io",
      repo,
      token,
      smJson.libraries,
      TMP_DIR
    );
    stderr.stop();
    expect(stderr.output).toContain(
      "Pushing existing Slice models to your repository"
    );

    expect(result).toBeTruthy();
  });
});
