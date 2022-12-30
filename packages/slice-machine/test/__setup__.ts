import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import fetch, { Blob, File, Headers, Request, Response } from "node-fetch";
import { FormData } from "formdata-polyfill/esm.min";
import { Buffer } from "node:buffer";
import { setupServer, SetupServerApi } from "msw/node";
import { cleanup } from "@testing-library/react";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

import "@testing-library/jest-dom";

declare module "vitest" {
  export interface TestContext {
    msw: SetupServerApi;
  }
}

const mswServer = setupServer();

beforeAll(() => {
  mswServer.listen({ onUnhandledRequest: "error" });
});

beforeEach(async (ctx) => {
  ctx.msw = mswServer;

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
          typeof window === "undefined" ? undefined : window.location.href;

        url = new URL(input, windowHref);
      }
    } else {
      throw new Error(
        "`fetch` with RequestInfo is not supported in this test environment."
      );
    }

    const res = await fetch(url.toString(), init);

    // node-fetch v3 will sometimes stall when decoding a response's body with
    // `text()`, `json()`, etc. This code assumes the first chunk has all of the
    // body's content and uses it as the response's body.
    //
    // For more details on the "bug", see: https://github.com/node-fetch/node-fetch/tree/55a4870ae5f805d8ff9a890ea2c652c9977e048e#custom-highwatermark
    const firstBodyChunk = await new Promise<string | undefined>((resolve) => {
      if (res.body) {
        res.body.on("data", (chunk) => {
          resolve(Buffer.from(chunk).toString("utf8"));
        });
      } else {
        resolve(undefined);
      }
    });

    if (firstBodyChunk) {
      return new Response(firstBodyChunk, {
        headers: res.headers,
        status: res.status,
        statusText: res.statusText,
      });
    } else {
      return res;
    }
  })
);

vi.stubGlobal(
  "ResizeObserver",
  vi.fn(() => {
    return {
      disconnect: vi.fn(),
      observe: vi.fn(),
      unobserve: vi.fn(),
    };
  })
);
