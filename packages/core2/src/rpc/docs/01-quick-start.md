# Quick start

1.  Create an RPC Express middleware containing your procedures. A procdure is any sync or async function that accept one or no arguments.

    The middleware can be used anywhere [Express middleware][express-middleware] is accepted.

    ```typescript
    // src/rpc-middleware.ts

    import { createRPCMiddleware, ExtractProcedures } from "@slicemachine/rpc";

    export const middleware = createRPCMiddleware({
    	procedures: {
    		ping: async () => {
    			await new Promise((resolve) => setTimeout(resolve, 1000));

    			return "pong";
    		},
    	},
    });

    // This type will be passed to the RPC client.
    export type Procedures = ExtractProcedures<typeof middleware>;
    ```

2.  Add the middleware to your Express-compatible server.

    ```typescript
    // src/server.ts

    import express from "express";
    import { middleware } from "./rpc-middleware";

    const app = express();

    // Pass `middleware` from the previous step.
    app.use("/rpc", middleware);

    app.listen();
    ```

    The server is now set up to accept RPC calls at `/rpc` using a client.

3.  In your remote app (e.g. your app's frontend), create a client to call the RPC server.

    ```typescript
    // src/index.ts

    import { createRPCClient } from "@slicemachine/rpc";
    import type { Procedures } from "./rpc-middleware";

    const client = createRPCClient<Procedures>({
    	serverURL: "https://example.com/rpc",
    });

    const pong = await client.ping(); // => "pong"
    ```

    Calling `client.ping()` will send a request to the server at `https://example.com/rpc` and return `ping()`'s return value from the server. The client is fully typed using your procedure's types.
