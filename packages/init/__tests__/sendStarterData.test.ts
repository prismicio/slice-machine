import { describe, test, jest, afterEach, expect } from "@jest/globals";
import npath from "path";
import { sendStarterData } from "../src/steps";
import {
  readCustomTypes,
  sendCustomTypesFromStarter,
} from "../src/steps/starters/custom-types";
import {
  getRemoteCustomTypeIds,
  sendManyCustomTypesToPrismic,
} from "../src/steps/starters/communication";
import nock from "nock";
import mockfs from "mock-fs";
import os from "os";
import mock from "mock-fs";
import inquirer from "inquirer";
import { stderr } from "stdout-stderr";

import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { isLeft, isRight } from "fp-ts/lib/Either";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import _ from "lodash";

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
const base = "https://prismic.io";
const cookies = `prismic-auth=${token}`;
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

describe("send starter data", () => {
  afterEach(() => {
    mock.restore();
    nock.cleanAll();
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
    const result = await sendStarterData(repo, base, cookies, TMP_DIR);
    stderr.stop();
    expect(result).toBeTruthy();
  });

  test("it should warn the user if they have remote slices", async () => {
    mockfs({
      [TMP_DIR]: {
        documents: {},
        "sm.json": JSON.stringify({
          apiEndpoint: "https://foo-bar.wroom.io/api/v2",
          libraries: ["@/slices"],
          framework: "none",
        }),
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
      },
    });

    const smApi = nock("https://customtypes.prismic.io")
      .matchHeader("repository", repo)
      .matchHeader("Authorization", `Bearer ${token}`);

    smApi.get("/slices").reply(200, [{}]);

    const promptSpy = jest
      .spyOn(inquirer, "prompt")
      .mockResolvedValue({ pushSlices: false });

    stderr.start();
    const result = await sendStarterData(repo, base, cookies, TMP_DIR);
    stderr.stop();

    expect(promptSpy).toHaveBeenCalled();
    expect(result).toBeTruthy();
  });

  test("it should do nothing when there is no documents directory", async () => {
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

    stderr.start();
    const result = await sendStarterData(repo, base, cookies, TMP_DIR);
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

    const result = await sendStarterData(
      repo,
      "https://wroom.io",
      cookies,
      TMP_DIR
    );

    stderr.stop();

    expect(result).toBeTruthy();
  });

  test("when the remote slice exists it should call the update endpoint", async () => {
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

    const result = await sendStarterData(
      repo,
      "https://wroom.io",
      cookies,
      TMP_DIR
    );

    stderr.stop();
    expect(result).toBeTruthy();
  });
});

describe("starters/custom-types", () => {
  afterEach(() => {
    mock.restore();
  });

  const CT_ON_DISK = {
    id: "blog-page",
    label: "Blog Page",
    repeatable: true,
    status: true,
    json: {},
  };

  describe("#readCustomtypes", () => {
    test("when ./customtypes is not found it should return an empty array", () => {
      mockfs({
        [TMP_DIR]: {},
      });
      const want: Array<CustomTypeSM> = [];
      const got = readCustomTypes(TMP_DIR);
      expect(got).toEqual(want);
    });

    test("when ./customtypes is not an directory is should return an empty array", () => {
      mockfs({
        [TMP_DIR]: {
          customtypes: "fooo",
        },
      });
      const want: Array<CustomTypeSM> = [];
      const got = readCustomTypes(TMP_DIR);
      expect(got).toEqual(want);
    });

    test("when ./customtypes is a direc tory it should read the file contents from that directory", () => {
      mockfs({
        [TMP_DIR]: {
          customtypes: {
            BlogPage: JSON.stringify(CT_ON_DISK),
          },
        },
      });

      const want = [CT_ON_DISK];
      const got = readCustomTypes(TMP_DIR);
      expect(got).toEqual(want);
    });
  });

  describe("#getRemoteCustomTypeIds", () => {
    test("it should return an array of remote slice ids", async () => {
      const customTypeEndpoint = "https://customtypes.prismic.io/";
      nock(customTypeEndpoint)
        .get("/customtypes")
        .matchHeader("repository", repo)
        .matchHeader("Authorization", `Bearer ${token}`)
        .reply(200, [CT_ON_DISK]);

      const wanted = [CT_ON_DISK].map((ct) => ct.id);
      const got = await getRemoteCustomTypeIds(customTypeEndpoint, repo, token);

      expect(got).toEqual(wanted);
    });
  });

  describe("#sendManyCustomTypesToPrismic", () => {
    const CT_ON_DISK = {
      id: "blog-page",
      label: "Blog Page",
      repeatable: true,
      status: true,
      json: {},
    };

    test("when there are no remote custom type is should send new slices", async () => {
      expect.assertions(1);
      const customTypeEndpoint = "https://customtypes.prismic.io";
      nock(customTypeEndpoint)
        .post("/customtypes/insert")
        .matchHeader("repository", repo)
        .matchHeader("Authorization", `Bearer ${token}`)
        .reply(200, (_, body) => {
          const result = CustomType.decode(body);
          expect(isRight(result)).toBeTruthy();
        });

      await sendManyCustomTypesToPrismic(
        repo,
        token,
        customTypeEndpoint,
        [],
        [CT_ON_DISK]
      );
    });

    test("when there are remote custom type that have the same id as local ones it'll update the custom type", async () => {
      expect.assertions(1);
      const customTypeEndpoint = "https://customtypes.prismic.io";
      nock(customTypeEndpoint)
        .post("/customtypes/update")
        .matchHeader("repository", repo)
        .matchHeader("Authorization", `Bearer ${token}`)
        .reply(204, (_, body) => {
          const result = CustomType.decode(body);
          expect(isRight(result)).toBeTruthy();
        });

      await sendManyCustomTypesToPrismic(
        repo,
        token,
        customTypeEndpoint,
        [CT_ON_DISK.id],
        [CT_ON_DISK]
      );
    });
  });

  describe("#sendCustomTypesFromStarter", () => {
    afterEach(() => {
      nock.cleanAll();
    });

    test("when there are no custom types it should do nothing", async () => {
      mockfs({
        [TMP_DIR]: {},
      });

      const result = await sendCustomTypesFromStarter(
        repo,
        token,
        base,
        TMP_DIR
      );

      expect(result).toBeFalsy();
    });

    test("when the user has custom types and remote remote custom-types it should prompt them", async () => {
      mockfs({
        [TMP_DIR]: {
          customtypes: JSON.stringify(CT_ON_DISK),
        },
      });

      const customTypeEndpoint = "https://customtypes.prismic.io";

      nock(customTypeEndpoint)
        .matchHeader("repository", repo)
        .matchHeader("Authorization", `Bearer ${token}`)
        .get("/customtypes")
        .reply(200, [CT_ON_DISK]);

      jest
        .spyOn(inquirer, "prompt")
        .mockResolvedValue({ pushCustomTypes: false });

      const result = await sendCustomTypesFromStarter(
        repo,
        token,
        base,
        TMP_DIR
      );

      expect(result).toBeFalsy();
    });

    test("is should send the custom-types to prismic", async () => {
      mockfs({
        [TMP_DIR]: {
          customtypes: {
            BlogPage: JSON.stringify(CT_ON_DISK),
          },
        },
      });

      const customTypeEndpoint = "https://customtypes.prismic.io";

      nock(customTypeEndpoint)
        .matchHeader("repository", repo)
        .matchHeader("Authorization", `Bearer ${token}`)
        .get("/customtypes")
        .reply(200, [])
        .post("/customtypes/insert")
        .reply(204, (_, body) => {
          const result = CustomType.decode(body);
          expect(isRight(result)).toBeTruthy();
        });

      const result = await sendCustomTypesFromStarter(
        repo,
        token,
        base,
        TMP_DIR
      );

      expect(result).toBeTruthy();
    });

    test("if the user confirms, it should update remote custom-types", async () => {
      mockfs({
        [TMP_DIR]: {
          customtypes: {
            BlogPage: JSON.stringify(CT_ON_DISK),
          },
        },
      });

      const customTypeEndpoint = "https://customtypes.prismic.io";

      // expect.assertions(2)
      nock(customTypeEndpoint)
        .matchHeader("repository", repo)
        .matchHeader("Authorization", `Bearer ${token}`)
        .get("/customtypes")
        .reply(200, [CT_ON_DISK])
        .post("/customtypes/update")
        .reply(204, (_, body) => {
          const result = CustomType.decode(body);
          expect(isRight(result)).toBeTruthy();
        });

      jest
        .spyOn(inquirer, "prompt")
        .mockResolvedValue({ pushCustomTypes: true });

      const result = await sendCustomTypesFromStarter(
        repo,
        token,
        base,
        TMP_DIR
      );

      expect(result).toBeTruthy();
    });
  });
});
