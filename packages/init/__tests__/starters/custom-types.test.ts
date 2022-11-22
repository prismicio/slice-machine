import { describe, test, jest, afterEach, expect } from "@jest/globals";
import npath from "path";
import {
  readLocalCustomTypes,
  sendCustomTypes,
} from "../../src/steps/starters/custom-types";
import nock from "nock";
import mockfs from "mock-fs";
import os from "os";
import mock from "mock-fs";
import inquirer from "inquirer";

import { isRight } from "fp-ts/lib/Either";
import { CustomTypeSM } from "@prismic-beta/slicemachine-core/build/models/CustomType";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { stderr } from "stdout-stderr";
import { InitClient } from "../../src/utils";
import { ApplicationMode } from "@slicemachine/client";

const TMP_DIR = npath.join(os.tmpdir(), "sm-init-starter-test");

const token = "aaaaaaa";
const repo = "bbbbbbb";

const client: InitClient = new InitClient(ApplicationMode.PROD, repo, token);

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
      const got = readLocalCustomTypes(TMP_DIR);
      expect(got).toEqual(want);
    });

    test("when ./customtypes is not an directory is should return an empty array", () => {
      mockfs({
        [TMP_DIR]: {
          customtypes: "fooo",
        },
      });
      const want: Array<CustomTypeSM> = [];
      const got = readLocalCustomTypes(TMP_DIR);
      expect(got).toEqual(want);
    });

    test("when ./customtypes is a direc tory it should read the file contents from that directory", () => {
      mockfs({
        [TMP_DIR]: {
          customtypes: {
            "blog-page": {
              "index.json": JSON.stringify(CT_ON_DISK),
            },
          },
        },
      });

      const want = [CT_ON_DISK];
      const got = readLocalCustomTypes(TMP_DIR);
      expect(got).toEqual(want);
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

      const result = await sendCustomTypes(client, TMP_DIR);

      expect(result).toBeFalsy();
    });

    test("when the user has custom types and remote remote custom-types it should prompt them", async () => {
      mockfs({
        [TMP_DIR]: {
          customtypes: {
            "blog-page": {
              "index.json": JSON.stringify(CT_ON_DISK),
            },
          },
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

      const result = await sendCustomTypes(client, TMP_DIR);

      expect(result).toBeFalsy();
    });

    test("is should send the custom-types to prismic", async () => {
      mockfs({
        [TMP_DIR]: {
          customtypes: {
            "blog-page": {
              "index.json": JSON.stringify(CT_ON_DISK),
            },
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

      stderr.start();
      const result = await sendCustomTypes(client, TMP_DIR);
      stderr.stop();

      expect(result).toBeTruthy();
      expect(stderr.output).toContain(
        "✔ Pushing existing custom types to your repository"
      );
    });

    test("if the user confirms, it should update remote custom-types", async () => {
      mockfs({
        [TMP_DIR]: {
          customtypes: {
            "blog-page": {
              "index.json": JSON.stringify(CT_ON_DISK),
            },
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

      stderr.start();
      const result = await sendCustomTypes(client, TMP_DIR);
      stderr.stop();

      expect(result).toBeTruthy();
      expect(stderr.output).toContain(
        "✔ Pushing existing custom types to your repository"
      );
    });

    test("when there's an error sending custom types it should exit", async () => {
      const exitSpy = jest
        .spyOn(process, "exit")
        .mockImplementationOnce(() => undefined as never);

      const errorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      mockfs({
        [TMP_DIR]: {
          customtypes: {
            "blog-page": {
              "index.json": JSON.stringify(CT_ON_DISK),
            },
          },
        },
      });

      nock(client.apisEndpoints.Models)
        .matchHeader("repository", repo)
        .matchHeader("Authorization", `Bearer ${token}`)
        .get("/customtypes")
        .reply(200, [])
        .post("/customtypes/insert")
        .reply(400, (_, body) => {
          const result = CustomType.decode(body);
          expect(isRight(result)).toBeTruthy();
        });

      stderr.start();

      const result = await sendCustomTypes(client, TMP_DIR);

      stderr.stop();

      expect(exitSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });
  });
});
