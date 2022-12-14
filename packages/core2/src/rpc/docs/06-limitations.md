# Limitations

## Binary data

On the server, binary data is handled using `Buffer`s. On the client, binary is data handled using `Blob`s. `@slicemachine/rpc` converts between both automatically.

Node.js supports `Blob` since v16.17, but Node.js code typically uses `Buffer`s. The `fs` module, for example, returns `Buffer`s, not `Blob`s.

```typescript
// src/rpc-middleware.ts

import * as fs from "node:fs/promises";
import { createRPCMiddleware } from "@slicemachine/rpc";

export const middleware = createRPCMiddleware({
	procedures: {
		write({ path, contents }: { path: string; contents: Buffer }) {
			await fs.writeFile(path, contents);
		},
	},
});

export type Procedures = ExtractProcedures<typeof middleware>;
```

```typescript
// src/client.ts

import { createRPCClient } from "@slicemachine/rpc";
import type { Procedures } from "./path/to/your/middleware";

const client = createRPCClient<Procedures>({
	serverURL: "https://example.com/rpc",
});

await client.write({
	path: "index.html",
	contents: new Blob(["<html>...</html>"]),
});
```

## Non-serializable data

Since data is passed between a client and a server, procedure arguments and return values must be serialized. `@slicemachine/rpc` uses [`FormData`][mdn-formdata] and [`devalue`][devalue] to send and serialize data.

Most JavaScript data can be used, but functions and classs cannot be serialized.

```typescript
export const middleware = createRPCMiddleware({
	procedures: {
		// INVALID: `callback` is not allowed!
		async ping({ callback }: { callback: () => void }) {
			await callback();

			return "pong";
		},
	},
});
```

## Procedure arguments

Procedures cannot accept more than one argument, but they can accept a single object argument with mulitple named properties.

```typescript
export const middleware = createRPCMiddleware({
	procedures: {
		// Allowed
		add({ a, b }: { a: number; b: number }) {
			return a + b;
		},

		// Not allowed
		subtract(a: number, b: number) {
			return a - b;
		},
	},
});
```

## Errors

Errors thrown by procedures are caught on the server, returned to the client, and re-thrown.

`Error`s can contain arbirtary data which may not be serializable. Thus, only the following properties are preserved across the network:

- `name`
- `message`
- `stack` (only in development)

Properties like `cause` or ones stored in custom errors are ignored.

[mdn-formdata]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[devalue]: https://github.com/Rich-Harris/devalue
