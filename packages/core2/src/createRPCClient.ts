class RPCClientError<Response> extends Error {
  response: Response;

  constructor(message = "An error occured", response: Response) {
    super(message);

    this.response = response;
  }
}

export type CreateRPCClientArgs = ConstructorParameters<typeof RPCClient>[0];

export const createRPCClient = (args: CreateRPCClientArgs): RPCClient => {
  return new RPCClient(args);
};

type RPCClientConstructorArgs = {
  port: number;
};

export class RPCClient {
  port: number;

  constructor({ port }: RPCClientConstructorArgs) {
    this.port = port;
  }

  async init(): Promise<void> {
    const res = await fetch(this._buildURL("/init"), { method: "post" });

    if (res.ok) {
      return;
    } else {
      try {
        const json = await res.json();
        throw new RPCClientError(json.error, json);
      } catch (_error) {
        throw new RPCClientError(undefined, undefined);
      }
    }
  }

  private _buildURL(path: string) {
    return new URL(path, `http://localhost:${this.port}`);
  }
}
