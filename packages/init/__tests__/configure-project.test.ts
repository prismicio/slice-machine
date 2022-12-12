import {
  jest,
  describe,
  afterEach,
  test,
  expect,
  beforeEach,
} from "@jest/globals";
import { configureProject } from "../src/steps";
import NodeUtils from "@slicemachine/core/build/node-utils";
import { Models } from "@slicemachine/core";
import Tracker from "../src/utils/tracker";
import { ApplicationMode } from "@slicemachine/client";
import { InitClient } from "../src/utils";

const startFn = jest.fn();
const successFn = jest.fn();
const failFn = jest.fn();

const client = new InitClient(ApplicationMode.PROD, null, "theBatman");

const trackingEventOutput = {
  anonymousId: "uuid",
  event: "SliceMachine Init End",
  properties: {
    framework: "react",
    repo: "repoName",
    result: "error",
    error: "Failed to configure Slice Machine",
  },
  context: { groupId: { Repository: "repoName" } },
};

jest.mock("../src/utils/logs", () => ({
  spinner: () => ({
    start: startFn,
    succeed: successFn,
    fail: failFn,
  }),
}));

const MockTracker = jest.fn((_, cb: () => void) => cb());
const MockIdentify = jest.fn().mockReturnThis();
jest.mock("analytics-node", () => {
  return jest.fn().mockImplementation(() => {
    return {
      track: MockTracker,
      identify: MockIdentify,
    };
  });
});

jest.mock("uuid", () => ({
  v4: () => "uuid",
}));

jest.mock("@slicemachine/core/build/node-utils", () => {
  // fragile test problem... If I change the core now I have to manage the mocks, we could mock the fs or calls to fs and not have to deal with this issue?
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const actualCore = jest.requireActual(
    "@slicemachine/core/build/node-utils"
  ) as typeof NodeUtils;

  return {
    ...actualCore,
    retrieveManifest: jest.fn(),
    createManifest: jest.fn(),
    patchManifest: jest.fn(),
    addJsonPackageSmScript: jest.fn(),
    Files: {
      ...actualCore.Files,
      exists: jest.fn(),
      mkdir: jest.fn(),
    },
  };
});

describe("configure-project", () => {
  void beforeEach(() => {
    jest.spyOn(process, "exit").mockImplementation((number) => number as never);
    Tracker.get().initialize("foo");
    Tracker.get().setRepository("repoName");
  });

  void afterEach(() => {
    jest.clearAllMocks();
  });

  const fakeCwd = "./";
  const fakeRepository = "testing-repo";
  const fakeFrameworkStats = {
    value: Models.Frameworks.react,
    manuallyAdded: false,
  };

  const retrieveManifestMock = NodeUtils.retrieveManifest as jest.Mock;
  const createManifestMock = NodeUtils.createManifest as jest.Mock;
  const patchManifestMock = NodeUtils.patchManifest as jest.Mock;
  const addJsonPackageSmScriptMock =
    NodeUtils.addJsonPackageSmScript as jest.Mock;

  const { exists, mkdir } = NodeUtils.Files;
  const fileExistsMock = exists as jest.Mock;
  const mkdirMock = mkdir as jest.Mock;

  test("it should create a new manifest if it doesn't exist yet", async () => {
    retrieveManifestMock.mockReturnValue({
      exists: false,
      content: null,
    });
    addJsonPackageSmScriptMock.mockReturnValue(true);

    await configureProject(
      client,
      fakeCwd,
      fakeRepository,
      fakeFrameworkStats,
      []
    );

    expect(retrieveManifestMock).toBeCalled();
    expect(createManifestMock).toHaveBeenCalledWith("./", {
      apiEndpoint: "https://testing-repo.prismic.io/api/v2",
      libraries: ["@/slices"],
    });
    expect(patchManifestMock).not.toBeCalled();

    expect(successFn).toHaveBeenCalled();
    expect(failFn).not.toHaveBeenCalled();
    expect(MockTracker).toHaveBeenCalled();
  });

  test("it should patch the existing manifest", async () => {
    retrieveManifestMock.mockReturnValue({
      exists: true,
      content: {
        framework: Models.Frameworks.react,
      },
    });
    addJsonPackageSmScriptMock.mockReturnValue(true);

    await configureProject(
      client,
      fakeCwd,
      fakeRepository,
      fakeFrameworkStats,
      []
    );

    expect(retrieveManifestMock).toBeCalled();
    expect(patchManifestMock).toHaveBeenCalledWith("./", {
      apiEndpoint: "https://testing-repo.prismic.io/api/v2",
      framework: "react",
      libraries: ["@/slices"],
    });

    expect(successFn).toHaveBeenCalled();
    expect(failFn).not.toHaveBeenCalled();
    expect(MockTracker).toHaveBeenCalled();
  });

  test("it should patch the existing manifest with external lib", async () => {
    retrieveManifestMock.mockReturnValue({
      exists: true,
      content: {
        framework: Models.Frameworks.react,
      },
    });
    addJsonPackageSmScriptMock.mockReturnValue(true);

    await configureProject(
      client,
      fakeCwd,
      fakeRepository,
      fakeFrameworkStats,
      ["@/material/slices"]
    );

    expect(retrieveManifestMock).toBeCalled();
    expect(patchManifestMock).toHaveBeenCalledWith("./", {
      apiEndpoint: "https://testing-repo.prismic.io/api/v2",
      framework: "react",
      libraries: ["@/slices", "@/material/slices"],
    });

    expect(successFn).toHaveBeenCalled();
    expect(failFn).not.toHaveBeenCalled();
    expect(MockTracker).toHaveBeenCalled();
  });

  test("it should fail if retrieve manifest throws", async () => {
    retrieveManifestMock.mockImplementation(() => {
      throw new Error("fake error to test the catch");
    });

    // process.exit should throw
    await configureProject(
      client,
      fakeCwd,
      fakeRepository,
      fakeFrameworkStats,
      []
    );

    expect(retrieveManifestMock).toBeCalled();
    expect(createManifestMock).not.toBeCalled();
    expect(patchManifestMock).not.toBeCalled();

    expect(successFn).not.toHaveBeenCalled();
    expect(failFn).toHaveBeenCalled();
    expect(MockTracker.mock.calls[0][0]).toEqual(trackingEventOutput);
  });

  test("it should fail if create or update manifest throws", async () => {
    retrieveManifestMock.mockReturnValue({
      exists: false,
      content: null,
    });
    createManifestMock.mockImplementation(() => {
      throw new Error("fake error to test the catch");
    });

    await configureProject(
      client,
      fakeCwd,
      fakeRepository,
      fakeFrameworkStats,
      []
    );

    expect(retrieveManifestMock).toBeCalled();
    expect(createManifestMock).toBeCalled();
    expect(patchManifestMock).not.toBeCalled();

    expect(successFn).not.toHaveBeenCalled();
    expect(failFn).toHaveBeenCalled();
    expect(MockTracker.mock.calls[0][0]).toEqual(trackingEventOutput);
  });

  test("it should fail if add SM script throws", async () => {
    retrieveManifestMock.mockReturnValue({
      exists: false,
      content: null,
    });
    createManifestMock.mockReturnValue(null); // we don't care about this void.
    addJsonPackageSmScriptMock.mockImplementation(() => {
      throw new Error("fake error to test the catch");
    });

    await configureProject(
      client,
      fakeCwd,
      fakeRepository,
      fakeFrameworkStats,
      []
    );

    expect(retrieveManifestMock).toBeCalled();
    expect(createManifestMock).toBeCalled();
    expect(patchManifestMock).not.toBeCalled();

    expect(successFn).not.toHaveBeenCalled();
    expect(failFn).toHaveBeenCalled();
    expect(MockTracker.mock.calls[0][0]).toEqual(trackingEventOutput);
  });

  test("it should create a slice folder if it doesnt exists.", async () => {
    // situation where the SM.Json doesn't exists.
    retrieveManifestMock.mockReturnValue({
      exists: false,
      content: null,
    });
    addJsonPackageSmScriptMock.mockReturnValue(true);

    // only called to verify if slice folder exists.
    fileExistsMock.mockReturnValue(false);

    await configureProject(client, fakeCwd, fakeRepository, fakeFrameworkStats);

    expect(mkdirMock).toHaveBeenCalled();
    expect(MockTracker).toHaveBeenCalled();
  });

  test("it shouldn't create a slice folder if it exists.", async () => {
    // situation where the SM.Json doesn't exists.
    retrieveManifestMock.mockReturnValue({
      exists: false,
      content: null,
    });
    addJsonPackageSmScriptMock.mockReturnValue(true);
    // only called to verify if slice folder exists.
    fileExistsMock.mockReturnValue(true);

    await configureProject(client, fakeCwd, fakeRepository, fakeFrameworkStats);

    expect(mkdirMock).not.toHaveBeenCalled();
    expect(MockTracker).toHaveBeenCalled();
  });

  test("it should not update the libraries property in sm.json if it exists", async () => {
    retrieveManifestMock.mockReturnValue({
      exists: true,
      content: {
        framework: Models.Frameworks.react,
        libraries: ["./slices2"],
      },
    });

    addJsonPackageSmScriptMock.mockReturnValue(true);
    // only called to verify if slice folder exists.
    fileExistsMock.mockReturnValue(true);

    await configureProject(client, fakeCwd, fakeRepository, fakeFrameworkStats);

    expect(mkdirMock).not.toHaveBeenCalled();
    expect(MockTracker).toHaveBeenCalled();

    expect(patchManifestMock).toHaveBeenCalledWith("./", {
      apiEndpoint: "https://testing-repo.prismic.io/api/v2",
      framework: "react",
      libraries: ["./slices2"],
    });
  });
});
