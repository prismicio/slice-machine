import { describe, test, afterEach, expect } from "@jest/globals";
import npath from "path";
import { sendStarterData } from "../src/steps";
import nock from "nock";
import mockfs from "mock-fs";
import os from "os";
import mock from "mock-fs";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { isLeft, isRight } from "fp-ts/lib/Either";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { InitClient } from "../src/utils";
import { ApplicationMode } from "@slicemachine/client";
import { stderr } from "stdout-stderr";

const TMP_DIR = npath.join(os.tmpdir(), "sm-init-starter-test");

const token = "aaaaaaa";
const repo = "bbbbbbb";
const fakeS3Url = "https://s3.amazonaws.com/prismic-io/";

const PATH_TO_STUB_PROJECT = npath.join(__dirname, "__stubs__", "fake-project");

const IMAGE_DATA_PATH = npath.join(
  ".slicemachine",
  "assets",
  "slices",
  "MySlice",
  "default",
  "preview.png"
);

const MODEL_PATH = npath.join("slices", "MySlice", "model.json");

const CT_ON_DISK = {
  id: "blog-page",
  label: "Blog Page",
  repeatable: true,
  status: true,
  json: {},
};

const imageUrlRegexp =
  /https:\/\/images.prismic.io\/bbbbbbb\/shared-slices\/my_slice\/default-[0-9a-z]+\/preview.png/;

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

describe("send starter data", () => {
  afterEach(() => {
    mock.restore();
  });

  test("it should do nothing when there is no documents directory", async () => {
    mockfs({
      [TMP_DIR]: {},
    });

    const result = await sendStarterData(clientProd, TMP_DIR);
    expect(result).toBeFalsy();
  });

  test("it should do nothing when there are no slices or custom types", async () => {
    const smJson = {
      apiEndpoint: "https://foo-bar.prismic.io/api/v2",
      libraries: ["@/slices"],
      framework: "none",
    };
    mockfs({
      [TMP_DIR]: {
        documents: {},
        "sm.json": JSON.stringify(smJson),
      },
    });

    const result = await sendStarterData(clientProd, TMP_DIR);
    expect(result).toBeFalsy();
  });

  test("when there are slices and custom types is should send them", async () => {
    const smJson = {
      apiEndpoint: "https://foo-bar.prismic.io/api/v2",
      libraries: ["@/slices"],
      framework: "none",
    };

    mockfs({
      [TMP_DIR]: {
        documents: {},
        customtypes: {
          "blog-page": {
            "index.json": JSON.stringify(CT_ON_DISK),
          },
        },
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

    nock(fakeS3Url).post("/", validateS3Body).reply(204);

    const customTypeEndpoint = "https://customtypes.prismic.io";
    nock(customTypeEndpoint)
      .matchHeader("repository", repo)
      .matchHeader("Authorization", `Bearer ${token}`)
      .get("/slices")
      .reply(200, [])
      .post("/slices/insert", (d) => {
        const body = SharedSlice.decode(d);
        if (isLeft(body)) return false;
        if (body.right.variations.length === 0) return false;
        const worked = imageUrlRegexp.test(body.right.variations[0].imageUrl);
        expect(worked).toBeTruthy();
        return worked;
      })
      .reply(200)
      .get("/customtypes")
      .reply(200, [])
      .post("/customtypes/insert")
      .reply(200, (_, body) => {
        const result = CustomType.decode(body);
        const worked = isRight(result);
        expect(worked).toBeTruthy();
        return worked;
      });

    stderr.start();

    const result = await sendStarterData(clientProd, TMP_DIR);

    stderr.stop();
    expect(result).toBeTruthy();

    expect.assertions(3);
  });
});
