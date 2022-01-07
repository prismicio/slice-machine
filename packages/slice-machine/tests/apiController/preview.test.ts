import previewHandler from "../../server/src/api/preview";
import { Frameworks } from "@slicemachine/core/build/src/models";
import { PreviewCheckResponse } from "../../lib/models/common/Preview";
import { RequestWithEnv } from "server/src/api/http/common";

import { retrieveJsonPackage } from "@slicemachine/core/build/src/fs-utils";

jest.mock("@slicemachine/core/build/src/fs-utils", () => ({
  __esModule: true,
  retrieveJsonPackage: jest.fn(),
}));

describe("preview controller", () => {
  const retrieveJsonPackageMocked = retrieveJsonPackage as jest.Mock;
  test("it should return all checks ko when no canvas url is sent", async () => {
    const requestWithoutPreviewUrl = {
      env: {
        framework: Frameworks.next,
        manifest: {},
      },
    } as RequestWithEnv;

    retrieveJsonPackageMocked.mockReturnValue({
      exists: true,
      content: {
        dependencies: {},
        devDependencies: {},
      },
    });
    const previewCheckResponse: PreviewCheckResponse = await previewHandler(
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
          localSlicePreviewURL: "http://localhost:3001/_canvas",
        },
      },
    } as RequestWithEnv;

    retrieveJsonPackageMocked.mockReturnValue({
      exists: true,
      content: {
        dependencies: {},
        devDependencies: {},
      },
    });
    const previewCheckResponse: PreviewCheckResponse = await previewHandler(
      requestWithPreviewUrl
    );
    expect(previewCheckResponse.manifest).toBe("ok");
    expect(previewCheckResponse.dependencies).toBe("ko");
  });

  test("it should return ok when all the next required deps are installed", async () => {
    const requestWithPreviewUrl = {
      env: {
        framework: Frameworks.next,
        manifest: {
          localSlicePreviewURL: "http://localhost:3001/_canvas",
        },
      },
    } as RequestWithEnv;

    retrieveJsonPackageMocked.mockReturnValue({
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
          localSlicePreviewURL: "http://localhost:3001/_canvas",
        },
      },
    } as RequestWithEnv;

    retrieveJsonPackageMocked.mockReturnValue({
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
      requestWithPreviewUrl
    );
    expect(previewCheckResponse.manifest).toBe("ok");
    expect(previewCheckResponse.dependencies).toBe("ok");
  });
});
