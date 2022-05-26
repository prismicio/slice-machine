import {
  describe,
  // expect,
  test,
  // jest,
  //  afterEach,
  //  beforeAll,
  //  beforeEach
} from "@jest/globals";

// import memfs from "memfs";

import npath from "path";
import { sendStarterData } from "../src/steps";

import nock from "nock";

const TMP_DIR = npath.join(__dirname, "__stubs__", "fake-project");

describe("send starter data", () => {
  test("should send slices and images from the file system to prismic", async () => {
    const token = "aaaaaaa";
    const repo = "bbbbbbb";
    const base = "https://prismic.io";
    const cookies = `prismic-auth=${token}`;

    const smApi = nock("https://customtypes.prismic.io", {
      reqheaders: {
        repository: repo,
        Authorization: `Bearer ${token}`,
      },
    });

    smApi.get("/slices").reply(200, []);
    // smApi.post('/slices/insert').reply(200) // note may have to be update if there will be any conflicts

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

    await sendStarterData(repo, base, cookies, TMP_DIR);
  });
});
