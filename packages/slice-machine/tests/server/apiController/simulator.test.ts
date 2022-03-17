// We mock the getEnv service
import * as Core from "@slicemachine/core";

import simulatorHandler from "../../../server/src/api/simulator";
import "@testing-library/jest-dom";
import { Frameworks } from "@slicemachine/core/build/models";
import { SimulatorCheckResponse } from "@models/common/Simulator";

jest.mock("@slicemachine/core", () => {
  const actualCore = jest.requireActual("@slicemachine/core");

  return {
    ...actualCore,
    NodeUtils: {
      retrieveJsonPackage: jest.fn<boolean, [{ cwd: string }]>(),
    },
  };
});

describe("simulator controller", () => {
  const retrieveJsonPackage = Core.NodeUtils.retrieveJsonPackage as jest.Mock;

  test("it should return all checks ko when no preview url is sent", async () => {
    const requestWithoutPreviewUrl = {
      env: {
        framework: Frameworks.next,
        manifest: {},
      },
    };

    retrieveJsonPackage.mockReturnValue({
      exists: true,
      content: {
        dependencies: {},
        devDependencies: {},
      },
    });
    const previewCheckResponse: SimulatorCheckResponse = await simulatorHandler(
      requestWithoutPreviewUrl
    );
    expect(previewCheckResponse.manifest).toBe("ko");
    expect(previewCheckResponse.dependencies).toBe("ko");
  });

  test("it should return ok on manifest if an url is present", async () => {
    const requestWithPreviewUrl = {
      env: {
        framework: Frameworks.next,
        manifest: {
          localSliceSimulatorURL: "http://localhost:3000/slice-simulator",
        },
      },
    };

    retrieveJsonPackage.mockReturnValue({
      exists: true,
      content: {
        dependencies: {},
        devDependencies: {},
      },
    });
    const previewCheckResponse: SimulatorCheckResponse = await simulatorHandler(
      requestWithPreviewUrl
    );
    expect(previewCheckResponse.manifest).toBe("ok");
    expect(previewCheckResponse.dependencies).toBe("ko");
  });

  test("it should return ok when all the legacy next required deps are installed", async () => {
    const requestWithPreviewUrl = {
      env: {
        framework: Frameworks.previousNext,
        manifest: {
          localSliceSimulatorURL: "http://localhost:3000/slice-simulator",
        },
      },
    };

    retrieveJsonPackage.mockReturnValue({
      exists: true,
      content: {
        dependencies: {
          "@prismicio/slice-simulator-react": "^2.6.12",
          "prismic-reactjs": "^0.3.0",
          "next-slicezone": "^0.1.0",
        },
        devDependencies: {},
      },
    });
    const previewCheckResponse: SimulatorCheckResponse = await simulatorHandler(
      requestWithPreviewUrl
    );
    expect(previewCheckResponse.manifest).toBe("ok");
    expect(previewCheckResponse.dependencies).toBe("ok");
  });

  test("it should return ok when all the next required deps are installed", async () => {
    const requestWithPreviewUrl = {
      env: {
        framework: Frameworks.next,
        manifest: {
          localSliceSimulatorURL: "http://localhost:3000/slice-simulator",
        },
      },
    };

    retrieveJsonPackage.mockReturnValue({
      exists: true,
      content: {
        dependencies: {
          "@prismicio/slice-simulator-react": "^2.6.12",
          "@prismicio/react": "^0.3.0",
          "@prismicio/helpers": "^0",
        },
        devDependencies: {},
      },
    });
    const previewCheckResponse: SimulatorCheckResponse = await simulatorHandler(
      requestWithPreviewUrl
    );
    expect(previewCheckResponse.manifest).toBe("ok");
    expect(previewCheckResponse.dependencies).toBe("ok");
  });

  test("it should return ok when all the previous nuxt required deps are installed", async () => {
    const requestWithPreviewUrl = {
      env: {
        framework: Frameworks.previousNuxt,
        manifest: {
          localSliceSimulatorURL: "http://localhost:3001/slice-simulator",
        },
      },
    };

    retrieveJsonPackage.mockReturnValue({
      exists: true,
      content: {
        dependencies: {
          "@prismicio/slice-simulator-vue": "^2.6.12",
          "nuxt-sm": "^0.3.0",
          "vue-slicezone": "^0.0.28",
          "@nuxtjs/prismic": "^0.0.28",
        },
        devDependencies: {},
      },
    });
    const previewCheckResponse: SimulatorCheckResponse = await simulatorHandler(
      requestWithPreviewUrl
    );
    expect(previewCheckResponse.manifest).toBe("ok");
    expect(previewCheckResponse.dependencies).toBe("ok");
  });

  test("it should return ok when all the nuxt required deps are installed", async () => {
    const requestWithPreviewUrl = {
      env: {
        framework: Frameworks.nuxt,
        manifest: {
          localSliceSimulatorURL: "http://localhost:3001/slice-simulator",
        },
      },
    };

    retrieveJsonPackage.mockReturnValue({
      exists: true,
      content: {
        dependencies: {
          "@prismicio/slice-simulator-vue": "^2.6.12",
          "@nuxtjs/prismic": "^0.0.28",
        },
        devDependencies: {},
      },
    });
    const previewCheckResponse: SimulatorCheckResponse = await simulatorHandler(
      requestWithPreviewUrl
    );
    expect(previewCheckResponse.manifest).toBe("ok");
    expect(previewCheckResponse.dependencies).toBe("ok");
  });
});
