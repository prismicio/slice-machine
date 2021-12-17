// We mock the getEnv service
import * as Core from "@slicemachine/core";

import previewHandler from "../../server/src/api/preview";
import { Frameworks } from "@slicemachine/core/build/src/models";
import { PreviewCheckResponse } from "../../lib/models/common/Preview";

jest.mock("@slicemachine/core", () => {
  const actualCore = jest.requireActual("@slicemachine/core");

  return {
    ...actualCore,
    FileSystem: {
      retrieveJsonPackage: jest.fn<boolean, [{ cwd: string }]>(),
    },
  };
});

describe("preview controller", () => {
  const retrieveJsonPackage = Core.FileSystem.retrieveJsonPackage as jest.Mock;

  test("it should return all checks ko when no canvas url is sent", async () => {
    const requestWithoutCanvasUrl = {
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
    const previewCheckResponse: PreviewCheckResponse = await previewHandler(
      requestWithoutCanvasUrl
    );
    expect(previewCheckResponse.manifest).toBe("ko");
    expect(previewCheckResponse.dependencies).toBe("ko");
  });

  test("it should return ok on manifest if an url is present", async () => {
    const requestWithCanvasUrl = {
      env: {
        framework: Frameworks.next,
        manifest: {
          localSliceCanvasURL: "http://localhost:3001/_canvas",
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
    const previewCheckResponse: PreviewCheckResponse = await previewHandler(
      requestWithCanvasUrl
    );
    expect(previewCheckResponse.manifest).toBe("ok");
    expect(previewCheckResponse.dependencies).toBe("ko");
  });

  test("it should return ok when all the next required deps are installed", async () => {
    const requestWithCanvasUrl = {
      env: {
        framework: Frameworks.next,
        manifest: {
          localSliceCanvasURL: "http://localhost:3001/_canvas",
        },
      },
    };

    retrieveJsonPackage.mockReturnValue({
      exists: true,
      content: {
        dependencies: {
          "@prismicio/slice-canvas-renderer-react": "^2.6.12",
          "prismic-reactjs": "^0.3.0",
          "next-slicezone": "^0.0.28",
        },
        devDependencies: {},
      },
    });
    const previewCheckResponse: PreviewCheckResponse = await previewHandler(
      requestWithCanvasUrl
    );
    expect(previewCheckResponse.manifest).toBe("ok");
    expect(previewCheckResponse.dependencies).toBe("ok");
  });

  test("it should return ok when all the nuxt required deps are installed", async () => {
    const requestWithCanvasUrl = {
      env: {
        framework: Frameworks.nuxt,
        manifest: {
          localSliceCanvasURL: "http://localhost:3001/_canvas",
        },
      },
    };

    retrieveJsonPackage.mockReturnValue({
      exists: true,
      content: {
        dependencies: {
          "@prismicio/slice-canvas-renderer-vue": "^2.6.12",
          "nuxt-sm": "^0.3.0",
          "vue-slicezone": "^0.0.28",
          "@nuxtjs/prismic": "^0.0.28",
        },
        devDependencies: {},
      },
    });
    const previewCheckResponse: PreviewCheckResponse = await previewHandler(
      requestWithCanvasUrl
    );
    expect(previewCheckResponse.manifest).toBe("ok");
    expect(previewCheckResponse.dependencies).toBe("ok");
  });
});
