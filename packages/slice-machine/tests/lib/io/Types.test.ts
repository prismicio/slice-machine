// import fs from "fs";
import { describe, test, beforeEach, afterEach } from "@jest/globals";
import { generateTypes } from "prismic-ts-codegen";

import { Manifest } from "@slicemachine/core/build/models";
import * as nodeUtils from "@slicemachine/core/build/node-utils/";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType/index";
import { SliceSM } from "@slicemachine/core/build/models/Slice";

import { upsert } from "../../../lib/io/Types";
import Files from "../../../lib/utils/files";

// Constants
const CWD = "/usr/test";
const CUSTOM_TYPE_MODELS: CustomTypeSM[] = [];
const SHARE_SLICE_MODELS: SliceSM[] = [];
const MOCKED = "__MOCKED__";

jest.mock("prismic-ts-codegen", () => {
  return { generateTypes: jest.fn(() => MOCKED) };
});
jest.mock("../../../lib/utils/files", () => {
  return { write: jest.fn(() => undefined) };
});
// See: https://github.com/aelbore/esbuild-jest/issues/26
jest.mock("@slicemachine/core/build/node-utils/", () => {
  return {
    __esModule: true,
    ...jest.requireActual("@slicemachine/core/build/node-utils/"),
  };
});

describe("upsert", () => {
  // Mock utilities
  const mockRetrieveManifest = (content?: Partial<Manifest>) => {
    jest.spyOn(nodeUtils, "retrieveManifest").mockImplementationOnce(() => ({
      exists: true,
      content: { apiEndpoint: "https://example.cdn.prismic.io", ...content },
    }));
  };
  const mockRetrieveJsonPackage = (
    content?: Partial<nodeUtils.JsonPackage>
  ) => {
    jest.spyOn(nodeUtils, "retrieveJsonPackage").mockImplementationOnce(() => ({
      exists: true,
      content: { name: "example", version: "0.0.0", ...content },
    }));
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("`@prismicio/types` is installed", () => {
    beforeEach(() => {
      // Mock `@prismicio/types` install
      mockRetrieveJsonPackage({
        dependencies: { "@prismicio/types": "latest" },
      });
    });

    test("writes types if `generateTypes` is missing", () => {
      mockRetrieveManifest();

      upsert(CWD, CUSTOM_TYPE_MODELS, SHARE_SLICE_MODELS);

      expect(generateTypes).toHaveBeenCalledTimes(1);
      expect(Files.write).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        expect.stringContaining(MOCKED)
      );
    });

    test("writes types if `generateTypes` is `true`", () => {
      mockRetrieveManifest({ generateTypes: true });

      upsert(CWD, CUSTOM_TYPE_MODELS, SHARE_SLICE_MODELS);

      expect(generateTypes).toHaveBeenCalledTimes(1);
      expect(Files.write).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        expect.stringContaining(MOCKED)
      );
    });

    test("doesn't write types if `generateTypes` is `false`", () => {
      mockRetrieveManifest({ generateTypes: false });

      upsert(CWD, CUSTOM_TYPE_MODELS, SHARE_SLICE_MODELS);

      expect(generateTypes).not.toHaveBeenCalled();
      expect(Files.write).not.toHaveBeenCalled();
    });
  });

  describe("`@prismicio/types` is not installed", () => {
    beforeEach(() => {
      // Mock `@prismicio/types` not installed
      mockRetrieveJsonPackage();
    });

    test("does not write types if `@prismicio/types` is not installed and `generateTypes` is missing", () => {
      mockRetrieveManifest();

      upsert(CWD, CUSTOM_TYPE_MODELS, SHARE_SLICE_MODELS);

      expect(generateTypes).not.toHaveBeenCalled();
      expect(Files.write).not.toHaveBeenCalled();
    });

    test("does not write types if `@prismicio/types` is not installed and `generateTypes` is `true`", () => {
      mockRetrieveManifest({ generateTypes: true });

      upsert(CWD, CUSTOM_TYPE_MODELS, SHARE_SLICE_MODELS);

      expect(generateTypes).not.toHaveBeenCalled();
      expect(Files.write).not.toHaveBeenCalled();
    });

    test("does not write types if `@prismicio/types` is installed and `generateTypes` is `false`", () => {
      mockRetrieveManifest({ generateTypes: false });

      upsert(CWD, CUSTOM_TYPE_MODELS, SHARE_SLICE_MODELS);

      expect(generateTypes).not.toHaveBeenCalled();
      expect(Files.write).not.toHaveBeenCalled();
    });
  });
});
