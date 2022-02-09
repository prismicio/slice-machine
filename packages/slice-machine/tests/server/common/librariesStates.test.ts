import fs from "fs";
import MockedBackendEnv from "../../__mocks__/backendEnvironment";
import { MockLibraryInfo } from "../../__mocks__/libraryState";
import { FileSystem, Utils } from "@slicemachine/core";
import * as LibrariesState from "../../../server/src/api/common/LibrariesState";

jest.mock(`fs`, () => {
  const { vol } = jest.requireActual("memfs");
  return vol;
});

jest.mock(`@slicemachine/core`, () => {
  const actualCore = jest.requireActual("@slicemachine/core");
  return {
    ...actualCore,
    Libraries: {
      handleLibraryPath: (cwd: string, lib: string) => MockLibraryInfo(lib),
    },
  };
});

// IMPORTANT: If this test breaks, then the librarie state model has been modified and will break other projects
// or you just modified the mocks and you shouldn't.
describe("server.generateLibraryState", () => {
  it("should generate a file in the .slicemachine folder with the right content", () => {
    LibrariesState.generateState(MockedBackendEnv);

    const pathToState = FileSystem.LibrariesStatePath(MockedBackendEnv.cwd);
    expect(Utils.Files.exists(pathToState)).toBeTruthy();

    const data = fs.readFileSync(pathToState, { encoding: "utf-8" });

    expect(JSON.parse(data)).toEqual({
      "@slices": {
        components: {
          slice1: {
            library: "@slices",
            id: "slice1",
            model: {
              id: "slice1",
              type: "SharedSlice",
              name: "slice1",
              description: "slice1",
              variations: [
                {
                  id: "default-slice",
                  name: "Default slice",
                  docURL: "...",
                  version: "sktwi1xtmkfgx8626",
                  description: "MyAwesomeSlice",
                  primary: {
                    title: {
                      type: "StructuredText",
                      config: {
                        single: "heading1",
                        label: "Title",
                        placeholder: "This is where it all begins...",
                      },
                    },
                    description: {
                      type: "StructuredText",
                      config: {
                        single: "paragraph",
                        label: "Description",
                        placeholder: "A nice description of your product",
                      },
                    },
                  },
                },
              ],
            },
            mocks: {},
            meta: {
              fileName: "slice1/models.json",
              isDirectory: false,
              extension: "js",
            },
            screenshotPaths: {},
          },
        },
      },
    });
  });
});
