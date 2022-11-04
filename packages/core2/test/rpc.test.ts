import { expect, it } from "vitest";
import { Blob } from "node:buffer";
import fetch from "node-fetch";

import {
	ExtractProcedures,
	createRPCClient,
	createRPCServer,
	proceduresFromInstance,
} from "../src/rpc";

it("creates an rpc server", async () => {
	const ping = (args: { input: string }) => ({ pong: args.input });
	const server = createRPCServer({
		procedures: { ping },
	});
	const { port } = await server.open();

	const client = createRPCClient<ExtractProcedures<typeof server>>({
		serverURL: `http://localhost:${port}`,
		fetch,
	});

	const res = await client.ping({ input: "foo" });

	await server.close();

	expect(res).toStrictEqual({ pong: "foo" });
});

it("supports procedures without arguments", async () => {
	const ping = () => "pong";
	const server = createRPCServer({
		procedures: { ping },
	});
	const { port } = await server.open();

	const client = createRPCClient<ExtractProcedures<typeof server>>({
		serverURL: `http://localhost:${port}`,
		fetch,
	});

	const res = await client.ping();

	await server.close();

	expect(res).toStrictEqual("pong");
});

it("supports procedures without return values", async () => {
	const ping = () => void 0;
	const server = createRPCServer({
		procedures: { ping },
	});
	const { port } = await server.open();

	const client = createRPCClient<ExtractProcedures<typeof server>>({
		serverURL: `http://localhost:${port}`,
		fetch,
	});

	const res = await client.ping();

	await server.close();

	expect(res).toBe(undefined);
});

it("supports procedures using JavaScript data structures", async () => {
	const dateDiff = (args: { a: Date; b: Date }) => {
		return args.b.getTime() - args.a.getTime();
	};
	const server = createRPCServer({
		procedures: { dateDiff },
	});
	const { port } = await server.open();

	const client = createRPCClient<ExtractProcedures<typeof server>>({
		serverURL: `http://localhost:${port}`,
		fetch,
	});

	const res = await client.dateDiff({
		a: new Date("1991-03-07"),
		b: new Date("1991-03-08"),
	});

	await server.close();

	expect(res).toBe(60 * 60 * 24 * 1000); // one day
});

it("supports procedures with file arguments", async () => {
	const ping = (args: { file: Buffer }) => {
		return args.file.toString();
	};
	const server = createRPCServer({
		procedures: { ping },
	});
	const { port } = await server.open();

	const client = createRPCClient<ExtractProcedures<typeof server>>({
		serverURL: `http://localhost:${port}`,
		fetch,
	});

	const res = await client.ping({
		file: new Blob([Buffer.from("pong")]),
	});

	await server.close();

	expect(res).toBe("pong");
});

it("supports procedures from class instances", async () => {
	class PingProcedures {
		private pong = "pong";

		ping() {
			return this.pong;
		}
	}
	const procedures = new PingProcedures();
	const server = createRPCServer({
		procedures: proceduresFromInstance(procedures),
	});
	const { port } = await server.open();

	const client = createRPCClient<ExtractProcedures<typeof server>>({
		serverURL: `http://localhost:${port}`,
		fetch,
	});

	const res = await client.ping();

	await server.close();

	expect(res).toStrictEqual("pong");
});

it("does not support procedures with file return values", async () => {
	const ping = () => {
		return Buffer.from("pong");
	};
	const server = createRPCServer({
		procedures: { ping },
	});
	const { port } = await server.open();

	const client = createRPCClient<ExtractProcedures<typeof server>>({
		serverURL: `http://localhost:${port}`,
		fetch,
	});

	await expect(async () => {
		await client.ping();
	}).rejects.toThrow(/unable to serialize server response/i);

	await server.close();
});

it("does not support function arguments", async () => {
	const ping = (args: { fn: () => void }) => {
		return args.fn();
	};
	const server = createRPCServer({
		procedures: { ping },
	});
	const { port } = await server.open();

	const client = createRPCClient<ExtractProcedures<typeof server>>({
		serverURL: `http://localhost:${port}`,
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
	const ping = () => {
		return () => void 0;
	};
	const server = createRPCServer({
		procedures: { ping },
	});
	const { port } = await server.open();

	const client = createRPCClient<ExtractProcedures<typeof server>>({
		serverURL: `http://localhost:${port}`,
		fetch,
	});

	await expect(async () => {
		await client.ping();
	}).rejects.toThrow(/unable to serialize server response/i);

	await server.close();
});
