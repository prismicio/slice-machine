import {
  jest,
  describe,
  afterEach,
  test,
  expect,
  beforeEach,
} from "@jest/globals";
import * as Core from "@slicemachine/core";
import { configureProject } from "../src/steps";
import { addJsonPackageSmScript } from "../src/steps/configure-project";

type SpinnerReturnType = ReturnType<typeof Core.Internals.spinner>;

const startFn = jest.fn<SpinnerReturnType, string[]>();
const successFn = jest.fn<SpinnerReturnType, string[]>();
const failFn = jest.fn<SpinnerReturnType, string[]>();

jest.mock("../src/steps/configure-project", () => {
  // @ts-expect-error typeof something
  const actual = jest.requireActual("../src/steps/configure-project") as {
    addJsonPackageSmScript: function;
  };

  return {
    ...actual,
    addJsonPackageSmScript: jest.fn<boolean, [{ cwd: string }]>(),
  };
});

jest.mock("@slicemachine/core", () => {
  const actualCore = jest.requireActual("@slicemachine/core") as typeof Core;

  return {
    ...actualCore,
    FsUtils: {
      ...actualCore.FsUtils,
      retrieveManifest: jest.fn<
        Core.FsUtils.FileContent<Core.Models.Manifest>,
        [{ cwd: string }]
      >(),
      createManifest: jest.fn<
        void,
        [{ cwd: string; manifest: Core.Models.Manifest }]
      >(),
      patchManifest: jest.fn<
        boolean,
        [{ cwd: string; data: Partial<Core.Models.Manifest> }]
      >(),
    },
    Internals: {
      ...actualCore.Internals,
      spinner: () => ({
        start: startFn,
        succeed: successFn,
        fail: failFn,
      }),
    },
  };
});

describe("configure-project", () => {
  void beforeEach(() => {
    jest.spyOn(process, "exit").mockImplementation((number) => number as never);
  });

  void afterEach(() => {
    jest.clearAllMocks();
  });

  const fakeCwd = "./";
  const fakeBase = "https://music.to.my.hears.io";
  const fakeRepository = "testing-repo";
  const fakeFrameworkStats = {
    value: Core.Models.Frameworks.react,
    manuallyAdded: false,
  };

  const retrieveManifestMock = Core.FsUtils.retrieveManifest as jest.Mock;
  const createManifestMock = Core.FsUtils.createManifest as jest.Mock;
  const patchManifestMock = Core.FsUtils.patchManifest as jest.Mock;
  const addJsonPackageSmScriptMock = addJsonPackageSmScript as jest.Mock;

  test("it should create a new manifest if it doesn't exist yet", () => {
    retrieveManifestMock.mockReturnValue({
      exists: false,
      content: null,
    });
    addJsonPackageSmScriptMock.mockReturnValue(true);

    configureProject(fakeCwd, fakeBase, fakeRepository, fakeFrameworkStats);

    expect(retrieveManifestMock).toBeCalled();
    expect(createManifestMock).toBeCalled();
    expect(patchManifestMock).not.toBeCalled();

    expect(successFn).toHaveBeenCalled();
    expect(failFn).not.toHaveBeenCalled();
  });

  test("it should patch the existing manifest", () => {
    retrieveManifestMock.mockReturnValue({
      exists: true,
      content: {
        framework: Core.Models.Frameworks.react,
      },
    });
    addJsonPackageSmScriptMock.mockReturnValue(true);

    configureProject(fakeCwd, fakeBase, fakeRepository, fakeFrameworkStats);

    expect(retrieveManifestMock).toBeCalled();
    expect(createManifestMock).not.toBeCalled();
    expect(patchManifestMock).toBeCalled();

    expect(successFn).toHaveBeenCalled();
    expect(failFn).not.toHaveBeenCalled();
  });

  test("it should fail if retrieve manifest throws", () => {
    retrieveManifestMock.mockImplementation(() => {
      throw new Error("fake error to test the catch");
    });

    // process.exit should throw
    configureProject(fakeCwd, fakeBase, fakeRepository, fakeFrameworkStats);

    expect(retrieveManifestMock).toBeCalled();
    expect(createManifestMock).not.toBeCalled();
    expect(patchManifestMock).not.toBeCalled();

    expect(successFn).not.toHaveBeenCalled();
    expect(failFn).toHaveBeenCalled();
  });

  test("it should fail if create manifest throws", () => {
    retrieveManifestMock.mockReturnValue({
      exists: false,
      content: null,
    });
    createManifestMock.mockImplementation(() => {
      throw new Error("fake error to test the catch");
    });

    configureProject(fakeCwd, fakeBase, fakeRepository, fakeFrameworkStats);

    expect(retrieveManifestMock).toBeCalled();
    expect(createManifestMock).toBeCalled();
    expect(patchManifestMock).not.toBeCalled();

    expect(successFn).not.toHaveBeenCalled();
    expect(failFn).toHaveBeenCalled();
  });

  test("it should fail if patch manifest throws", () => {
    retrieveManifestMock.mockReturnValue({
      exists: true,
      content: {
        framework: Core.Models.Frameworks.react,
      },
    });
    patchManifestMock.mockImplementation(() => {
      throw new Error("fake error to test the catch");
    });

    configureProject(fakeCwd, fakeBase, fakeRepository, fakeFrameworkStats);

    expect(retrieveManifestMock).toBeCalled();
    expect(createManifestMock).not.toBeCalled();
    expect(patchManifestMock).toBeCalled();

    expect(successFn).not.toHaveBeenCalled();
    expect(failFn).toHaveBeenCalled();
  });

  test("it should fail if add SM script throws", () => {
    retrieveManifestMock.mockReturnValue({
      exists: false,
      content: null,
    });
    createManifestMock.mockReturnValue(null); // we don't care about this void.
    addJsonPackageSmScriptMock.mockImplementation(() => {
      throw new Error("fake error to test the catch");
    });

    configureProject(fakeCwd, fakeBase, fakeRepository, fakeFrameworkStats);

    expect(retrieveManifestMock).toBeCalled();
    expect(createManifestMock).toBeCalled();
    expect(patchManifestMock).not.toBeCalled();

    expect(successFn).not.toHaveBeenCalled();
    expect(failFn).toHaveBeenCalled();
  });
});
