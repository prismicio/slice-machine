import * as hapi from "@hapi/hapi";
import open from "open";
import * as logs from "../logs";
import { Prismic, Utils, CONSTS } from "@slicemachine/core";

const { Cookie } = Utils;
const { PrismicSharedConfigManager } = Prismic;
const { DEFAULT_BASE, DEFAULT_SERVER_PORT } = CONSTS;

const { bold, underline, spinner, writeError } = logs;

export type HandlerData = { email: string; cookies: ReadonlyArray<string> };

export const isHandlerData = (
  data: string | Record<string, unknown>
): data is HandlerData => {
  if (typeof data != "object") return false;

  const { email, cookies } = data as Partial<HandlerData>;
  return (
    Boolean(email && cookies) &&
    Array.isArray(cookies) &&
    !cookies.some((c: unknown) => typeof c !== "string")
  );
};

const Routes = {
  authentication:
    (server: hapi.Server) =>
    (
      onSuccess: (data: HandlerData) => void,
      onFail: () => void
    ): hapi.ServerRoute => ({
      method: "POST",
      path: "/",
      handler: authenticationHandler(server)(onSuccess, onFail),
    }),

  notFound: {
    method: ["GET", "POST"],
    path: "/{any*}",
    handler: (
      request: hapi.Request,
      h: hapi.ResponseToolkit
    ): hapi.ResponseObject => {
      return h
        .response(`not found: [${request.method}]: ${request.url.toString()}`)
        .code(404);
    },
  },
};

export function validatePayload(
  payload: Buffer | string | Record<string, unknown>
): HandlerData | null {
  if (Buffer.isBuffer(payload)) return null;
  return isHandlerData(payload) ? payload : null;
}

const authenticationHandler =
  (server: hapi.Server) =>
  (onSuccess: (data: HandlerData) => void, onFail: () => void) => {
    return (request: hapi.Request, h: hapi.ResponseToolkit) => {
      try {
        const data: HandlerData | null = validatePayload(
          request.payload as Buffer | string | Record<string, unknown>
        ); // type coming from the lib

        if (!data) {
          onFail();
          h.response("Error with cookies").code(400);
          throw new Error(
            "It seems the server didn't respond properly, please contact us."
          );
        }
        onSuccess(data);
        return h.response(data).code(200);
      } finally {
        void server.stop({ timeout: 10000 });
      }
    };
  };

function buildServer(base: string, port: number, host: string): hapi.Server {
  const server = hapi.server({
    port,
    host,
    routes: {
      cors: {
        origin: [base],
        headers: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
      },
    },
  });
  return server;
}

export function askSingleChar(title: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(title);
    const rawMode: boolean = process.stdin.isRaw;
    if (process.stdin.setRawMode) process.stdin.setRawMode(true);

    function handler(key: Buffer) {
      const response: string = key.toString("utf-8");
      if (process.stdin.setRawMode) process.stdin.setRawMode(Boolean(rawMode));
      process.stdin.removeListener("data", handler);
      resolve(response);
    }

    process.stdin.on("data", handler);
  });
}

export async function startServerAndOpenBrowser(
  url: string,
  action: "login" | "signup",
  base: string = DEFAULT_BASE,
  port: number = DEFAULT_SERVER_PORT
): Promise<{
  onLoginFail: () => void;
}> {
  const confirmation = await askSingleChar(
    `>> Press any key to open the browser to ${action} or q to exit:`
  );
  if (confirmation === "q" || confirmation === "\u0003")
    return process.exit(-1);

  const s = spinner("Waiting for the browser response");

  const onLoginFail = () => {
    s.stop();
    writeError(`We failed to log you into your Prismic account`);
    console.log(`Run ${bold("npx slicemachine init")} again!`);
    process.exit(-1);
  };

  function onSuccess(data: HandlerData) {
    s.succeed(`Logged in as ${bold(data.email)}`).stop();
    PrismicSharedConfigManager.setProperties({
      cookies: Cookie.serializeCookies(data.cookies),
      base,
    });
  }

  function onFail(): void {
    onLoginFail();
  }

  const server = buildServer(base, port, "localhost");
  server.route([
    Routes.authentication(server)(onSuccess, onFail),
    Routes.notFound,
  ]);

  return server.start().then(() => {
    console.log("\nOpening browser to " + underline(url));
    s.start();
    void open(url);
    return {
      onLoginFail,
    };
  });
}
