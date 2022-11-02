import { createServer, Server } from "node:http";
import { createApp, eventHandler, toNodeListener } from "h3";
import {
  createSliceMachinePluginRunner,
  SliceMachinePluginRunner,
  SliceMachineProject,
} from "@slicemachine/plugin-kit";

import customTypeCreateHandler from "./routes/custom-type/create";
import initHandler from "./routes/init";

export type CreateRPCServerArgs = ConstructorParameters<typeof RPCServer>[0];

export const createRPCServer = (args: CreateRPCServerArgs): RPCServer => {
  return new RPCServer(args);
};

export type RPCServerConstructorArgs = {
  project: SliceMachineProject;
};

export type RPCServerStartArgs = {
  port?: number;
};

export type RPCServerStartReturnType = {
  port: number;
};

export class RPCServer {
  private _pluginRunner: SliceMachinePluginRunner;
  private _server: Server;

  constructor({ project }: RPCServerConstructorArgs) {
    this._pluginRunner = createSliceMachinePluginRunner({ project });

    const app = createApp();
    app.use(
      eventHandler((event) => {
        event.context.pluginRunner = this._pluginRunner;
      })
    );

    app.use("/init", initHandler);
    app.use("/custom-type/create", customTypeCreateHandler);

    // const router = createRouter();
    // router.use("/init", initHandler, ["post"]);
    // router.use("/custom-type/create", customTypeCreateHandler, ["post"]);

    // app.use(router);

    this._server = createServer(toNodeListener(app));
  }

  open({ port }: RPCServerStartArgs = {}): Promise<RPCServerStartReturnType> {
    return new Promise((resolve, reject) => {
      this._server.once("listening", () => {
        const address = this._server.address();

        if (address && address !== null && typeof address !== "string") {
          return resolve({ port: address.port });
        } else {
          this._server.close();

          reject(new Error("Unable to start server"));
        }
      });

      this._server.listen({ port });
    });
  }

  close(): Promise<void> {
    return new Promise((resolve) => {
      this._server.once("close", resolve);

      this._server.close();
    });
  }
}
