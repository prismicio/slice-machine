import { jest, describe, afterEach, test, expect } from "@jest/globals";
import * as Core from "slicemachine-core";
import { configureProject } from "../src/steps";

type SpinnerReturnType = ReturnType<typeof Core.Utils.spinner>;

const startFn = jest.fn<SpinnerReturnType, string[]>();
const successFn = jest.fn<SpinnerReturnType, string[]>();
const failFn = jest.fn<SpinnerReturnType, string[]>();

jest.mock("slicemachine-core", () => {
  const actualCore = jest.requireActual("slicemachine-core") as typeof Core;

  return {
    ...actualCore,
    FileSystem: {
      ...actualCore.FileSystem,
      retrieveManifest: jest.fn<
        Core.FileSystem.FileContent<Core.FileSystem.Manifest>,
        [{ cwd: string }]
      >(),
      createManifest: jest.fn<
        void,
        [{ cwd: string; manifest: Core.FileSystem.Manifest }]
      >(),
      patchManifest: jest.fn<
        boolean,
        [{ cwd: string; data: Partial<Core.FileSystem.Manifest> }]
      >(),
      addJsonPackageSmScript: jest.fn<boolean, [{ cwd: string }]>(),
    },
    Utils: {
      ...actualCore.Utils,
      spinner: () => ({
        start: startFn,
        succeed: successFn,
        fail: failFn,
      }),
    },
  };
});

describe("configure-project", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const fakeCwd = "./";
  const fakeBase = "https://music.to.my.hears.io" as Core.Utils.Endpoints.Base;
  const fakeRepository = "testing-repo";
  const fakeFrameworkStats = {
    value: Core.Utils.Framework.none,
    manuallyAdded: false,
  };

  test("it should create a new manifest if it doesn't exist yet", () => {
    jest.spyOn(process, "exit").mockImplementation(() => Promise.reject());

    (Core.FileSystem.retrieveManifest as jest.Mock).mockReturnValue({
      exists: false,
      content: null,
    });

    (Core.FileSystem.addJsonPackageSmScript as jest.Mock).mockReturnValue(true);

    configureProject(fakeCwd, fakeBase, fakeRepository, fakeFrameworkStats);

    expect(Core.FileSystem.retrieveManifest as jest.Mock).toBeCalled();
    expect(Core.FileSystem.patchManifest as jest.Mock).not.toBeCalled();

    expect(successFn).toHaveBeenCalled();
    expect(failFn).not.toHaveBeenCalled();
  });
});
