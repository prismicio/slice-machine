import {
  describe,
  test,
  // jest,
  afterEach,
  expect
} from "@jest/globals";
import mockfs from "mock-fs";
import os from "os";
import path from "path";

import {readSignatureFile, readDocuments} from '../../src/steps/starters/documents'

const TMP_DIR = path.join(os.tmpdir(), "sm-init-starter-test");

describe("readSignatureFile", () => {
  afterEach(() => {
    mockfs.restore();
  });

  test("it should read the signature file", async () => {
    mockfs({
      [TMP_DIR]: {
        documents: {
          "index.json": JSON.stringify({ signature: "xyz" }),
        },
      },
    });

    const result = await readSignatureFile(TMP_DIR)
    expect(result.signature).toEqual("xyz")
  });

  test("it should throw is the signature is invalid", async () => {
    mockfs({
      [TMP_DIR]: {
        documents: {
          "index.json": JSON.stringify({ foo: "bar" }),
        },
      },
    });

    await expect(readSignatureFile(TMP_DIR)).rejects.toThrow()
  
  });
});

describe("readDocuments", () => {
  test("it should read all the documents from the documents directory", async () => {
    const fakeDocs = JSON.stringify({
      uid: "home",
      title: [
        { type: "heading1", content: { text: "Hello", spans: [] } },
      ],
      uid_TYPE: "UID",
      uid_POSITION: 0,
      title_TYPE: "StructuredText",
      title_POSITION: 1,
      slugs_INTERNAL: ["hello"],
      uids_INTERNAL: [],
    })

    mockfs({
      [TMP_DIR]: {
        documents: {
          "en-gb": {
            fooo: fakeDocs
          },
        },
      },
    });

    const result = await readDocuments(TMP_DIR)
    expect(result).toContain(fakeDocs)
  });
});
