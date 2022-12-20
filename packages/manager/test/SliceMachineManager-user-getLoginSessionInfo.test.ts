import { expect, it } from "vitest";
import { createServer } from "node:http";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

it("returns a URL and port to facilitate browser-based authentication", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	const res = await manager.user.getLoginSessionInfo();

	expect(res).toStrictEqual({
		port: 5555,
		url: "https://prismic.io/dashboard/cli/login?source=slice-machine&port=5555",
	});
});

it("returns a random port if the default port is in use", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	const server = createServer();
	server.listen(5555);

	const res = await manager.user.getLoginSessionInfo();

	server.close();

	expect(res.port).not.toBe(5555);
	expect(res.port).toStrictEqual(expect.any(Number));
});
