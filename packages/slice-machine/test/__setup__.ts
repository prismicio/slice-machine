import "@testing-library/jest-dom";

import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

import { createMockFactory, MockFactory } from "@prismicio/mock";
import { createSliceMachineManager } from "@slicemachine/manager";
import { createSliceMachineManagerMSWHandler } from "@slicemachine/manager/test";
import { cleanup } from "@testing-library/react";
import { FormData } from "formdata-polyfill/esm.min";
import { SetupServer, setupServer } from "msw/node";
import { rest } from "msw";
import fetch, { Blob, File, Headers, Request, Response } from "node-fetch";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";

import pkg from "../package.json";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

declare module "vitest" {
  export interface TestContext {
    msw: SetupServer;
    createMock: MockFactory;
  }
}

const mswServer = setupServer(
  // Disable all feature flags by default.
  rest.get("https://api.lab.amplitude.com/sdk/v2/vardata", (_req, res, ctx) => {
    return res(ctx.json({}));
  }),
);

beforeAll(() => {
  mswServer.listen({ onUnhandledRequest: "error" });
});

beforeEach(async (ctx) => {
  ctx.msw = mswServer;
  ctx.createMock = createMockFactory({ seed: ctx.task.id });

  const adapter = createTestPlugin();
  const cwd = await createTestProject({ adapter });
  const manager = createSliceMachineManager({
    nativePlugins: { [adapter.meta.name]: adapter },
    cwd,
  });

  await manager.telemetry.initTelemetry({
    appName: pkg.name,
    appVersion: pkg.version,
  });
  await manager.plugins.initPlugins();

  ctx.msw.use(
    createSliceMachineManagerMSWHandler({
      url: "http://localhost:3000/_manager",
      sliceMachineManager: manager,
    }),
  );

  await fs.mkdir(os.homedir(), { recursive: true });
  await fs.rm(path.join(os.homedir(), ".prismic"), { force: true });
  await fs.rm(path.join(os.homedir(), ".prismicrc"), { force: true });
});

afterEach((ctx) => {
  vi.clearAllMocks();

  cleanup();

  ctx.msw.resetHandlers();
});

afterAll(() => {
  mswServer.close();
});

vi.mock("fs", async () => {
  const memfs: typeof import("memfs") = await vi.importActual("memfs");

  return {
    ...memfs.fs,
    default: memfs.fs,
  };
});

vi.mock("fs/promises", async () => {
  const memfs: typeof import("memfs") = await vi.importActual("memfs");

  return {
    ...memfs.fs.promises,
    default: memfs.fs.promises,
  };
});

// jsdom environment removes Node native modules which is desired.
// However, because we create a plugin before each tests and that
// they rely on Prettier, which relies on `node:url`, we need to
// bypass jsdom restricted browser environment by mocking `node:url`
// to itself.
vi.mock("url", async () => {
  const actual: typeof import("node:url") = await vi.importActual("node:url");

  return actual;
});

vi.mock("@segment/analytics-node", () => {
  const MockSegmentClient = vi.fn();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  MockSegmentClient.prototype.group = vi.fn(
    (_message: unknown, callback?: (error?: unknown) => void) => {
      if (callback) {
        callback();
      }
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  MockSegmentClient.prototype.identify = vi.fn(
    (_message: unknown, callback?: (error?: unknown) => void) => {
      if (callback) {
        callback();
      }
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  MockSegmentClient.prototype.track = vi.fn(
    (_message: unknown, callback?: (error?: unknown) => void) => {
      if (callback) {
        callback();
      }
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  MockSegmentClient.prototype.on = vi.fn();

  return {
    Analytics: MockSegmentClient,
  };
});

// We have to manually set this environment variable as there's no equivalent of
// `next/jest` for Vitest. It means Vitest doesn't read Next.js's configuration
// file and (in our case) the `experimental.newNextLinkBehavior` setting.
vi.stubEnv("__NEXT_NEW_LINK_BEHAVIOR", "true");

vi.stubGlobal("FormData", FormData);
vi.stubGlobal("Blob", Blob);
vi.stubGlobal("File", File);
vi.stubGlobal("Headers", Headers);
vi.stubGlobal("Request", Request);
vi.stubGlobal("Response", Response);
vi.stubGlobal(
  "fetch",
  vi.fn(async (input, init) => {
    // node-fetch does not support relative URLs. If a relative URL is detected,
    // we attempt to base it on `window.location.href`, if present.
    let url;
    if (input instanceof URL || typeof input === "string") {
      try {
        url = new URL(input);
      } catch {
        const windowHref =
          typeof window === "undefined"
            ? "http://localhost:3000"
            : window.location.href;
        url = new URL(input, windowHref);
      }
    } else {
      throw new Error(
        "`fetch` with RequestInfo is not supported in this test environment.",
      );
    }

    const res = await fetch(url.toString(), init);

    // node-fetch v3 will sometimes stall when decoding a response's body with
    // `text()`, `json()`, etc. This code assumes the first chunk has all of the
    // body's content and uses it as the response's body.
    //
    // For more details on the "bug", see: https://github.com/node-fetch/node-fetch/tree/55a4870ae5f805d8ff9a890ea2c652c9977e048e#custom-highwatermark
    const firstBodyChunk = await new Promise<Buffer | undefined>((resolve) => {
      if (res.body) {
        res.body.on("data", (chunk: Buffer) => {
          resolve(chunk);
        });
      } else {
        resolve(undefined);
      }
    });

    if (firstBodyChunk) {
      return new Response(firstBodyChunk, res);
    } else {
      return res;
    }
  }),
);

// Adapted from: https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom.
vi.stubGlobal(
  "matchMedia",
  vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
);

vi.stubGlobal(
  "ResizeObserver",
  vi.fn(() => {
    return {
      disconnect: vi.fn(),
      observe: vi.fn(),
      unobserve: vi.fn(),
    };
  }),
);
