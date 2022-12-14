# Setting up procedures on the server

An HTTP server is required to use RPCs; it is the "remote" in "remote procedure calls." `@slicemachine/rpc` supports any server that accepts Express middleware, such as [Express][express], [Fastify][fastify], or [h3][h3].

Use `createRPCMiddleware()` to create an Express middleware that handles RPC requests. The middleware contains code to run your procedures as well as the TypeScript types to type your client.

The following example creates an RPC middleware with a `ping()` procedure. The procedure waits 1000 milliseconds before returning `"pong"`.

```typescript
// src/rpc-middleware.ts

import { createRPCMiddleware, ExtractProcedures } from "@slicemachine/rpc";

export const middleware = createRPCMiddleware({
	procedures: {
		async ping() {
			await new Promise((resolve) => setTimeout(resolve, 1000));

			return "pong";
		},
	},
});

// This type will be passed to the RPC client.
export type Procedures = ExtractProcedures<typeof middleware>;
```

The exported `Procedures` type will be provided to the client to get full compile time type safety.

The middleware should be added to an HTTP server and served locally (e.g. `http://localhost:3000`) or remotely (e.g. `https://example.com`). The middleware can live alongside other routes in the server.

```typescript
// src/server.ts

import express from "express";
import { middleware } from "./rpc-middleware";

const app = express();

// Provide the RPC middleware created using `createRPCMiddleware()`.
app.use("/rpc", middleware);

app.listen();
```

[express]: https://expressjs.com/
[fastify]: https://www.fastify.io/
[h3]: https://github.com/unjs/h3
