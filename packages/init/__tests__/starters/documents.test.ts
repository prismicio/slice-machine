import { describe, test, jest, afterEach, expect } from "@jest/globals";
import mockfs from "mock-fs";
import os from "os";
import path from "path";

const TMP_DIR = path.join(os.tmpdir(), "sm-init-starter-test");

describe("readSignature", () => {
  test("it should read the signature file", () => {
    mockfs({
      [TMP_DIR]: {
        documents: {
          "index.json": JSON.stringify({ signature: "xyz" }),
        },
      },
    });
  });
});

describe("readDocuments", () => {
  test("it should read all the documents from the documents directory", () => {
    mockfs({
      [TMP_DIR]: {
        documents: {
          "en-gb": {
            fooo: JSON.stringify({
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
            }),
          },
        },
      },
    });
  });
});
