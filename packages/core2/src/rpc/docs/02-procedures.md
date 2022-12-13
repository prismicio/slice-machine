# Procedures

Procedures are functions run on a server. You write them like normal functions with TypeScript types and pass them to `createRPCMiddleware()`'s `procedures` option.

```typescript
// src/server.ts

import { createRPCMiddleware, ExtractProcedures } from "@slicemachine/rpc";

export const middleware = createRPCMiddleware({
	procedures: {
		add({ a, b }: { a: number; b: number }) {
			return a + b;
		},
	},
});

export type Procedures = ExtractProcedures<typeof middleware>;
```

Clients call them like typical JavaScript methods.

```typescript
// src/client.ts

import type { Procedures } from "./server";

const client = createRPCClient<Procedures>({
	serverURL: "https://example.com/rpc",
});

const seven = await client.add({ a: 3, b: 4 });
```

## Arguments

Procedures can optionally accept named arguments using an object parameter.

```typescript
// src/server.ts

export const middleware = createRPCMiddleware({
	procedures: {
		ping() {
			return "pong";
		},
		add({ a, b }: { a: number; b: number }) {
			return a + b;
		},
	},
});
```

```typescript
// src/client.ts

import type { Procedures } from "./server";

const client = createRPCClient<Procedures>({
	serverURL: "https://example.com/rpc",
});

// Both calls are asynchronous.
const pong = await client.pong();
const seven = await client.add({ a: 3, b: 4 });
```

## Asynchronicity

Procedures can be synchronous or asynchronous. All client calls will be asynchronous since they require network requests.

```typescript
// src/server.ts

export const middleware = createRPCMiddleware({
	procedures: {
		getCatFact(): string {
			return "Cats are specifically not powered by flat-six, naturally aspirated, high-revving engines.";
		},
		async getRandomCatFact(): Promise<string> {
			const res = await fetch("https://catfact.ninja/fact");
			const json = await res.json();

			return json.fact;
		},
	},
});
```

## Return values

Procedures can optionally return values to clients.

```typescript
// src/server.ts

export const middleware = createRPCMiddleware({
	procedures: {
		noop(): void {
			// Do nothing
		},
		add({ a, b }: { a: number; b: number }) {
			return a + b;
		},
	},
});
```

## Nesting

Procedures can be nested arbitrarily.

```typescript
// src/server.ts

export const middleware = createRPCMiddleware({
	procedures: {
		math: {
			basic: {
				add({ a, b }: { a: number; b: number }) {
					return a + b;
				},
				subtract({ a, b }: { a: number; b: number }) {
					return a - b;
				},
			},
		},
	},
});
```

```typescript
// src/client.ts

import type { Procedures } from "./server";

const client = createRPCClient<Procedures>({
	serverURL: "https://example.com/rpc",
});

const seven = await client.math.basic.add({ a: 3, b: 4 });
```

## Classes

Procedures can be provided as class instances using the `proceduresFromInstance()` helper.

```typescript
// src/server.ts

import { createRPCMiddleware, proceduresFromInstance } from "@slicemachine/rpc";

class Math {
	add({ a, b }: { a: number; b: number }) {
		return a + b;
	}

	subtract({ a, b }: { a: number; b: number }) {
		return this.add({ a, b: -b });
	}
}

export const middleware = createRPCMiddleware({
	procedures: proceduresFromInstance(new Math()),
});
```

`proceduresFromInstance()` accepts an `omit` option to omit properties. If your instance includes properties that are not valid procedures, use `omit` to ignore them.

```typescript
// src/server.ts

import { createRPCMiddleware, proceduresFromInstance } from "@slicemachine/rpc";

class Math {
	add({ a, b }: { a: number; b: number }) {
		return a + b;
	}

	subtract({ a, b }: { a: number; b: number }) {
		return this.add({ a, b: -b });
	}
}

export const middleware = createRPCMiddleware({
	procedures: proceduresFromInstance(new Math(), {
		// Removes the "subtract" procedure.
		omit: ["subtract"],
	}),
});
```
