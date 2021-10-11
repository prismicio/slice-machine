import * as hapi from "@hapi/hapi";
import open from "open";
import {
  CONSTS,
  bold,
  underline,
  error,
  buildEndpoints,
  spinner,
} from "../utils";
import { setAuthConfigCookies, removeAuthConfig } from "../filesystem";

export type HandlerData = { email: string; cookies: ReadonlyArray<string> };

const isHandlerData = (
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

function validatePayload(
  payload: Buffer | string | Record<string, unknown>
): HandlerData | null {
  if (Buffer.isBuffer(payload)) return null;
  return isHandlerData(payload) ? payload : null;
}

const authenticationHandler =
  (server: hapi.Server) =>
  (onSuccess: (data: HandlerData) => void, onFail: () => void) => {
    return async (request: hapi.Request, h: hapi.ResponseToolkit) => {
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

function askSingleChar(title: string): Promise<string> {
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
  base: string = CONSTS.DEFAULT_BASE,
  port: number = CONSTS.DEFAULT_SERVER_PORT
): Promise<void> {
  const confirmation = await askSingleChar(
    `>> Press any key to open the browser to ${action} or q to exit:`
  );
  if (confirmation === "q" || confirmation === "\u0003")
    return process.exit(-1);

  return new Promise((resolve) => {
    const s = spinner("Waiting for the browser response");

    function onSuccess(data: HandlerData) {
      s.succeed(`Logged in as ${bold(data.email)}`).stop();
      setAuthConfigCookies(base, data.cookies);
      resolve(); // todo add cookies here
    }

    function onFail(): void {
      s.fail(
        `${error("Error!")} We failed to log you into your Prismic account`
      );
      console.log(`Run ${bold("npx slicemachine init")} again!`);
      process.exit(-1);
    }

    const server = buildServer(base, port, "localhost");
    server.route([
      Routes.authentication(server)(onSuccess, onFail),
      Routes.notFound,
    ]);

    server.start().then(() => {
      console.log("Opening browser to " + underline(url));
      s.start();
      void open(url);
    });
  });
}

export const Auth = {
  login: async (base: string): Promise<void> => {
    const endpoints = buildEndpoints(base);
    return startServerAndOpenBrowser(
      endpoints.Dashboard.cliLogin,
      "login",
      base
    );
  },
  signup: async (base: string): Promise<void> => {
    const endpoints = buildEndpoints(base);
    return startServerAndOpenBrowser(
      endpoints.Dashboard.cliSignup,
      "signup",
      base
    );
  },
  logout: (): void => removeAuthConfig(),
};
