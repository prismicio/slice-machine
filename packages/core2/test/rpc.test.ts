import { expect, it, vi } from "vitest";
import fetch from "node-fetch";
import { createApp, fromNodeMiddleware, toNodeListener } from "h3";
import { createServer, Server } from "node:http";
import type { AddressInfo } from "node:net";
import { Buffer } from "node:buffer";

import {
	createRPCClient,
	createRPCMiddleware,
	proceduresFromInstance,
} from "../src/rpc";

type ListeningServer = {
	address: AddressInfo;
	close: () => Promise<void>;
};

type ListenConfig = {
	port?: number;
};

export const listen = async (
	server: Server,
	config: ListenConfig = {},
): Promise<ListeningServer> => {
	await new Promise<void>((resolve) => {
		server.once("listening", () => {
			resolve();
		});

		server.listen({ port: config.port });
	});

	return {
		address: server.address() as AddressInfo,
		close: async () => {
			await new Promise<void>((resolve) => {
				server.once("close", () => {
					resolve();
				});

				server.close();
			});
		},
	};
};

type CreateRPCTestServerArgs = {
	procedures: Parameters<typeof createRPCMiddleware>[0]["procedures"];
};

const createRPCTestServer = (args: CreateRPCTestServerArgs) => {
	const app = createApp();

	const rpcMiddleware = createRPCMiddleware({ procedures: args.procedures });
	app.use(fromNodeMiddleware(rpcMiddleware));

	return createServer(toNodeListener(app));
};

it("creates an rpc server", async () => {
	const procedures = {
		ping: (args: { input: string }) => ({ pong: args.input }),
	};
	const server = await listen(createRPCTestServer({ procedures }));

	const client = createRPCClient<typeof procedures>({
		serverURL: `http://localhost:${server.address.port}`,
		fetch,
	});

	const res = await client.ping({ input: "foo" });

	await server.close();

	expect(res).toStrictEqual({ pong: "foo" });
});

it("supports procedures without arguments", async () => {
	const procedures = { ping: () => "pong" };
	const server = await listen(createRPCTestServer({ procedures }));

	const client = createRPCClient<typeof procedures>({
		serverURL: `http://localhost:${server.address.port}`,
		fetch,
	});

	const res = await client.ping();

	await server.close();

	expect(res).toStrictEqual("pong");
});

it("supports procedures without return values", async () => {
	const procedures = { ping: () => void 0 };
	const server = await listen(createRPCTestServer({ procedures }));

	const client = createRPCClient<typeof procedures>({
		serverURL: `http://localhost:${server.address.port}`,
		fetch,
	});

	const res = await client.ping();

	await server.close();

	expect(res).toBe(undefined);
});

it("supports procedures using JavaScript data structures", async () => {
	const procedures = {
		dateDiff: (args: { a: Date; b: Date }) =>
			args.b.getTime() - args.a.getTime(),
	};
	const server = await listen(createRPCTestServer({ procedures }));

	const client = createRPCClient<typeof procedures>({
		serverURL: `http://localhost:${server.address.port}`,
		fetch,
	});

	const res = await client.dateDiff({
		a: new Date("1991-03-07"),
		b: new Date("1991-03-08"),
	});

	await server.close();

	expect(res).toBe(60 * 60 * 24 * 1000); // one day
});

it("supports procedures with Buffer arguments", async () => {
	const procedures = {
		ping: (args: { file: Buffer }) => args.file.toString(),
	};
	const server = await listen(createRPCTestServer({ procedures }));

	const client = createRPCClient<typeof procedures>({
		serverURL: `http://localhost:${server.address.port}`,
		fetch,
	});

	const res = await client.ping({
		file: new Blob(["pong"]),
	});

	await server.close();

	expect(res).toBe("pong");
});

it("supports procedures with Buffer return values", async () => {
	const procedures = { ping: () => Buffer.from("pong") };
	const server = await listen(createRPCTestServer({ procedures }));

	const client = createRPCClient<typeof procedures>({
		serverURL: `http://localhost:${server.address.port}`,
		fetch,
	});

	const res = await client.ping();

	await server.close();

	expect(await res.text()).toBe("pong");
});

it("supports procedures from class instances", async () => {
	class PingProcedures {
		private pong = "pong";

		ping() {
			return this.pong;
		}
	}
	const procedures = proceduresFromInstance(new PingProcedures());
	const server = await listen(createRPCTestServer({ procedures }));

	const client = createRPCClient<typeof procedures>({
		serverURL: `http://localhost:${server.address.port}`,
		fetch,
	});

	const res = await client.ping();

	await server.close();

	expect(res).toStrictEqual("pong");
});

it("supports namespaced procedures", async () => {
	const procedures = {
		sports: {
			ping: () => "pong",
		},
	};
	const server = await listen(createRPCTestServer({ procedures }));

	const client = createRPCClient<typeof procedures>({
		serverURL: `http://localhost:${server.address.port}`,
		fetch,
	});

	const res = await client.sports.ping();

	await server.close();

	expect(res).toBe("pong");
});

it("does not support function arguments", async () => {
	const procedures = { ping: (args: { fn: () => void }) => args.fn() };
	const server = await listen(createRPCTestServer({ procedures }));

	const client = createRPCClient<typeof procedures>({
		serverURL: `http://localhost:${server.address.port}`,
		fetch,
	});

	await expect(async () => {
		await client.ping({
			fn: () => void 0,
		});
	}).rejects.toThrow(/cannot stringify a function/i);

	await server.close();
});

it("does not support function return values", async () => {
	const procedures = { ping: () => () => void 0 };
	const server = await listen(createRPCTestServer({ procedures }));

	const client = createRPCClient<typeof procedures>({
		serverURL: `http://localhost:${server.address.port}`,
		fetch,
	});

	const consoleErrorSpy = vi
		.spyOn(globalThis.console, "error")
		.mockImplementation(() => void 0);

	await expect(async () => {
		await client.ping();
	}).rejects.toThrow(/unable to serialize server response/i);

	consoleErrorSpy.mockRestore();

	await server.close();
});

it("does not support class arguments", async () => {
	class Foo {
		bar() {
			return "baz";
		}
	}

	const procedures = { ping: (args: { foo: Foo }) => args.foo.bar() };
	const server = await listen(createRPCTestServer({ procedures }));

	const client = createRPCClient<typeof procedures>({
		serverURL: `http://localhost:${server.address.port}`,
		fetch,
	});

	await expect(async () => {
		await client.ping({
			foo: new Foo(),
		});
	}).rejects.toThrow(/cannot stringify arbitrary non-POJOs/i);

	await server.close();
});

it("does not support class return values", async () => {
	class Foo {
		bar() {
			return "baz";
		}
	}

	const procedures = { ping: () => new Foo() };
	const server = await listen(createRPCTestServer({ procedures }));

	const client = createRPCClient<typeof procedures>({
		serverURL: `http://localhost:${server.address.port}`,
		fetch,
	});

	const consoleErrorSpy = vi
		.spyOn(globalThis.console, "error")
		.mockImplementation(() => void 0);

	await expect(async () => {
		await client.ping();
	}).rejects.toThrow(/unable to serialize server response/i);

	consoleErrorSpy.mockRestore();

	await server.close();
});
