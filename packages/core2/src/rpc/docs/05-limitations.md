# Limitations

## Binary data

On the server, binary data is handled using `Buffers`s. On the client, binary is data handled using `Blob`s. `@slicemachine/rpc` converts between both automatically.

```typescript
// src/server.ts

import * as fs from "node:fs/promises";
import { createRPCMiddleware } from "@slicemachine/rpc";

export const middleware = createRPCMiddleware({
	procedures: {
		write({ path, contents }: { path: string; contents: Binary }) {
			await fs.writeFile(path, contents);
		},
	},
});

export type Procedures = ExtractProcedures<typeof middleware>;
```

```typescript
// src/client.ts

import type { Procedures } from "./path/to/your/server";

const client = createRPCClient<Procedures>({
	serverURL: "https://example.com/rpc",
});

await client.write({
	path: "index.html",
	contents: new Blob(["<html>...</html>"]),
});
```

## Non-serializable data

Since data is passed between a client and a server, procedure arguments and return values must be serializable. Functions and classs cannot be serialized. `@slicemachine/rpc` uses [`FormData`][mdn-formdata] and [`devalue`][devalue] to send and serialize data.

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

[mdn-formdata]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[devalue]: https://github.com/Rich-Harris/devalue
