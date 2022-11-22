// import fs from "fs";
import { describe, test, beforeEach, afterEach } from "@jest/globals";
import { generateTypes } from "prismic-ts-codegen";

import { Manifest } from "@prismic-beta/slicemachine-core/build/models";
import * as nodeUtils from "@prismic-beta/slicemachine-core/build/node-utils/";
import { BackendEnvironment } from "@lib/models/common/Environment";
import { upsert } from "../../../lib/io/Types";
import Files from "../../../lib/utils/files";
import { getLocalCustomTypes } from "../../../lib/utils/customTypes";
import { getLocalSlices } from "../../../lib/utils/slices";

// Constants
const MOCKED = "__MOCKED__";

// Mocked files
jest.mock("prismic-ts-codegen", () => {
  return { generateTypes: jest.fn(() => MOCKED) };
});
// See: https://github.com/aelbore/esbuild-jest/issues/26
jest.mock("@prismic-beta/slicemachine-core/build/node-utils/", () => {
  return {
    __esModule: true,
    ...jest.requireActual("@prismic-beta/slicemachine-core/build/node-utils/"),
  };
});
jest.mock("../../../lib/utils/customTypes", () => {
  return { getLocalCustomTypes: jest.fn(() => []) };
});
jest.mock("../../../lib/utils/slices", () => {
  return { getLocalSlices: jest.fn(() => []) };
});
jest.mock("../../../lib/utils/files", () => {
  return { write: jest.fn(() => undefined) };
});

describe("upsert", () => {
  // Mock utilities
  const mockBackendEnvironmentManifest = (
    manifest?: Partial<Manifest>
  ): BackendEnvironment => {
    return {
      cwd: "/usr/test",
      manifest: { apiEndpoint: "https://example.cdn.prismic.io", ...manifest },
    } as BackendEnvironment;
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
      upsert(mockBackendEnvironmentManifest());

      expect(getLocalCustomTypes).toHaveBeenCalledTimes(1);
      expect(getLocalSlices).toHaveBeenCalledTimes(1);
      expect(generateTypes).toHaveBeenCalledTimes(1);
      expect(Files.write).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        expect.stringContaining(MOCKED)
      );
    });

    test("writes types if `generateTypes` is `true`", () => {
      upsert(mockBackendEnvironmentManifest({ generateTypes: true }));

      expect(getLocalCustomTypes).toHaveBeenCalledTimes(1);
      expect(getLocalSlices).toHaveBeenCalledTimes(1);
      expect(generateTypes).toHaveBeenCalledTimes(1);
      expect(Files.write).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        expect.stringContaining(MOCKED)
      );
    });

    test("doesn't write types if `generateTypes` is `false`", () => {
      upsert(mockBackendEnvironmentManifest({ generateTypes: false }));

      expect(getLocalCustomTypes).not.toHaveBeenCalled();
      expect(getLocalSlices).not.toHaveBeenCalled();
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
      upsert(mockBackendEnvironmentManifest());

      expect(getLocalCustomTypes).not.toHaveBeenCalled();
      expect(getLocalSlices).not.toHaveBeenCalled();
      expect(generateTypes).not.toHaveBeenCalled();
      expect(Files.write).not.toHaveBeenCalled();
    });

    test("does not write types if `@prismicio/types` is not installed and `generateTypes` is `true`", () => {
      upsert(mockBackendEnvironmentManifest({ generateTypes: true }));

      expect(getLocalCustomTypes).not.toHaveBeenCalled();
      expect(getLocalSlices).not.toHaveBeenCalled();
      expect(generateTypes).not.toHaveBeenCalled();
      expect(Files.write).not.toHaveBeenCalled();
    });

    test("does not write types if `@prismicio/types` is installed and `generateTypes` is `false`", () => {
      upsert(mockBackendEnvironmentManifest({ generateTypes: false }));

      expect(getLocalCustomTypes).not.toHaveBeenCalled();
      expect(getLocalSlices).not.toHaveBeenCalled();
      expect(generateTypes).not.toHaveBeenCalled();
      expect(Files.write).not.toHaveBeenCalled();
    });
  });
});
