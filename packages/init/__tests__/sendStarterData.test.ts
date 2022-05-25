import {
  describe,
  // expect,
  test,
  jest,
  //  afterEach,
  //  beforeAll,
  //  beforeEach
} from "@jest/globals";

// import memfs from "memfs";
import fs from "fs";
import npath from "path";
import { sendStarterData } from "../src/steps";

import modelStub from "./__stubs__/fake-project/slices/MySlice/model.json";
import os from "os";

import nock from "nock";

const actualFs = jest.requireActual("fs") as typeof fs;
const imageData = actualFs.readFileSync(
  npath.join(__dirname, "__stubs__", "preview.png"),
  "utf-8"
);

const TMP_DIR = os.tmpdir();

describe("send starter data", () => {
  // beforeEach(() => {
  //   vol.reset()
  // })

  test("should send slices and images from the file system to prismic", async () => {
    const token = "aaaaaaa";
    const repo = "bbbbbbb";
    const base = "https://prismic.io";
    const cookies = `prismic-auth=${token}`;
    const smJson = {
      libraries: ["@/slices"],
    };

    jest.spyOn(fs, "lstatSync").mockImplementation((...args) => {
      console.log("lstatSync");
      console.log(args);
      const [path] = args;
      if (
        path === npath.join(TMP_DIR, "sm.json") ||
        path === npath.join(TMP_DIR, "slices") ||
        path === npath.join(TMP_DIR, "slices", "MySlice", "model.json") ||
        path ===
          npath.join(
            TMP_DIR,
            "slices",
            "MySlice",
            "default-slice",
            "preview.jpeg"
          )
      ) {
        return {} as fs.Stats;
      }

      if (path === npath.join(TMP_DIR, "slices", "MySlice")) {
        return {
          isDirectory: () => true,
        } as fs.Stats;
      }
      return actualFs.lstatSync(...args);
    });

    jest.spyOn(fs, "readFileSync").mockImplementation((...args) => {
      const [path, options] = args;
      if (path.toString().endsWith("sm.json")) {
        return JSON.stringify(smJson);
      }
      if (path.toString().endsWith("model.json")) {
        return JSON.stringify(modelStub);
      }

      if (path.toString().endsWith("preview.png")) {
        return imageData;
      }

      return actualFs.readFileSync(path, options);
    });

    jest.spyOn(fs, "readdirSync").mockImplementation((...args) => {
      const [path, options] = args;
      console.log("readdirSync");
      console.log(args);
      if (path === npath.join(TMP_DIR, "slices")) {
        return ["MySlice"] as unknown as fs.Dirent[];
      }
      if (path === npath.join(TMP_DIR, "slices", "MySlice")) {
        return ["model.json", "index..js"] as unknown as fs.Dirent[];
      }
      return actualFs.readdirSync(path, options);
    });

    jest.spyOn(fs, "mkdirSync").mockImplementation((...args) => {
      console.log("mkdirsync");
      console.log(args);
      return "";
    });
    //  const hasSM = fs.lstatSync(path.join(TMP_DIR, "sm.json"))
    // console.log({hasSM})
    // slices check and maybe post
    const smApi = nock("https://customtypes.prismic.io", {
      reqheaders: {
        repository: repo,
        Authorization: `Bearer ${token}`,
      },
    });

    smApi.get("/slices").reply(200, []);
    // smApi.post('/slices/insert').reply(200) // note may have to be update if there will be any conflicts

    const fakeS3Url = "https://s3.amazonaws.com/prismic-io";
    // acl reequest
    // const acl =
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

    // const s3 =
    nock(fakeS3Url)
      .post("/", (body) => {
        if (!body) return false;
        return true;
      })
      .reply(204);

    await sendStarterData(repo, base, cookies, TMP_DIR);
  });
});

// curl \
// -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidXNlciIsImlkIjoiNWNkM2VjN2ExMTAwMDA4OTRiMDRhYzA2IiwiZGF0ZSI6MTY1MzM5NDgzOCwiaWF0IjoxNjUzMzk0ODM4fQ.cSSX9Kwp4OTZ9SlAwQ4YHlw4pmoQFfRDKBBu1UJCfjM" \
// -H "repository: sm-test-init-11-05-22" \
// -H "User-Agent: slice-machine" \
// https://0yyeb2g040.execute-api.us-east-1.amazonaws.com/prod/create
