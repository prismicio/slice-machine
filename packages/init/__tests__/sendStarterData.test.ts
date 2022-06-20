import { describe, test, afterEach, expect, jest } from "@jest/globals";
import npath from "path";
import { sendStarterData } from "../src/steps";
import nock from "nock";
import mockfs from "mock-fs";
import os from "os";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { isLeft, isRight } from "fp-ts/lib/Either";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { stderr } from "stdout-stderr";
import * as t from "io-ts";
import fs from "fs";
import path from "path";

interface SmJson {
  apiEndpoint: string;
  libraries: string[];
  framework: string;
}

const TMP_DIR = npath.join(os.tmpdir(), "sm-init-starter-test");

const token = "aaaaaaa";
const repo = "bbbbbbb";
const base = "https://prismic.io";
const cookies = `prismic-auth=${token}`;
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

describe("send starter data", () => {
  afterEach(() => {
    mockfs.restore();
    nock.cleanAll();
  });

  test("it should do nothing when there is no documents directory", async () => {
    mockfs({
      [TMP_DIR]: {},
    });

    const result = await sendStarterData(repo, base, cookies, true, TMP_DIR);
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

    const result = await sendStarterData(repo, base, cookies, true, TMP_DIR);
    expect(result).toBeFalsy();
  });

  test("when there are slices, custom types and documents it should send them", async () => {
    const processExitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);

    const smJson = {
      apiEndpoint: `https://${repo}.prismic.io/api/v2`,
      libraries: ["@/slices"],
      framework: "none",
    };

    mockFiles(smJson);

    mockApiCalls(smJson, false);

    expect(fs.existsSync(path.join(TMP_DIR, "documents"))).toBe(true);

    stderr.start();
    const result = await sendStarterData(repo, base, cookies, true, TMP_DIR);
    stderr.stop();

    expect(result).toBeTruthy();
    expect(processExitSpy).not.toBeCalled();
    expect(stderr.output).toContain(
      "✔ Pushing existing Slice models to your repository"
    );
    expect(stderr.output).toContain(
      "✔ Pushing existing custom types to your repository"
    );
    expect(stderr.output).toContain(
      "✔ Pushing existing documents to your repository"
    );

    expect(fs.existsSync(path.join(TMP_DIR, "documents"))).toBe(false);

    expect.assertions(10);
  });

  test("when pushing documents to a repository that already has some, the init script fails", async () => {
    const processExitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementationOnce(() => undefined);

    const smJson = {
      apiEndpoint: `https://${repo}.prismic.io/api/v2`,
      libraries: ["@/slices"],
      framework: "none",
    };

    mockFiles(smJson);

    mockApiCalls(smJson, true);

    expect(fs.existsSync(path.join(TMP_DIR, "documents"))).toBe(true);

    stderr.start();
    const result = await sendStarterData(repo, base, cookies, true, TMP_DIR);
    stderr.stop();

    expect(result).toBeFalsy();
    expect(processExitSpy).toBeCalled();
    expect(stderr.output).toContain(
      "✔ Pushing existing Slice models to your repository"
    );
    expect(stderr.output).toContain(
      "✔ Pushing existing custom types to your repository"
    );
    expect(stderr.output).toContain(
      "✖ Pushing existing documents to your repository"
    );

    expect(fs.existsSync(path.join(TMP_DIR, "documents"))).toBe(true);

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy.mock.calls[0][0]).toContain(
      "The selected repository is not empty, documents cannot be uploaded. Please choose an empty repository or delete the documents contained in your repository."
    );

    expect.assertions(11);
  });

  test("when sendDocs is false it should not send the documents", async () => {
    const processExitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);

    const smJson = {
      apiEndpoint: `https://${repo}.prismic.io/api/v2`,
      libraries: ["@/slices"],
      framework: "none",
    };

    mockFiles(smJson);

    mockApiCalls(smJson, false);

    expect(fs.existsSync(path.join(TMP_DIR, "documents"))).toBe(true);

    stderr.start();
    const result = await sendStarterData(repo, base, cookies, false, TMP_DIR);
    stderr.stop();

    expect(result).toBeTruthy();
    expect(processExitSpy).not.toBeCalled();
    expect(stderr.output).toContain(
      "✔ Pushing existing Slice models to your repository"
    );
    expect(stderr.output).toContain(
      "✔ Pushing existing custom types to your repository"
    );
    expect(stderr.output).not.toContain(
      "✖ Pushing existing documents to your repository"
    );

    expect(fs.existsSync(path.join(TMP_DIR, "documents"))).toBe(true);

    expect.assertions(9);
  });
});

//////// HELPER METHODS ////////
const mockFiles = (smJson: SmJson) => {
  mockfs({
    [TMP_DIR]: {
      documents: mockfs.load(npath.join(PATH_TO_STUB_PROJECT, "documents")),
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
};

const mockApiCalls = (smJson: SmJson, existingDocsInRepository: boolean) => {
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

  const prismicUrl = new URL(smJson.apiEndpoint);

  const documentsNock = nock(prismicUrl.origin)
    .matchHeader("Cookie", `prismic-auth=${token}`)
    .post("/starter/documents");

  if (existingDocsInRepository) {
    documentsNock.reply(400, () => {
      return "Repository should not contain documents";
    });
  } else {
    documentsNock.reply(200, (_, body) => {
      const docs = t.record(t.string, t.string).decode(body);
      // todo: check signature
      const result = isRight(docs);
      expect(result).toBeTruthy();

      return result;
    });
  }
};
