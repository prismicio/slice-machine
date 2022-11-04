import { createRPCServer, createRPCClient } from "./index";
import { createManager } from "../createClient";
import { proceduresFromInstance } from "./proceduresFromInstance";
import { ExtractProcedures } from "./types";

// On the server
// type SliceMachineProceduresConstructorArgs = {
// 	client: Client;
// };
//
// class SliceMachineProcedures {
// 	private _client!: Client;
//
// 	constructor({ client }: SliceMachineProceduresConstructorArgs) {
// 		this._client = client;
// 	}
//
// 	// This calls the plugin runner to run the `custom-type:read` hook.
// 	readCustomType = this._client.readCustomType.bind(this._client);
// }

const sliceMachineClient = createManager();
const server = createRPCServer({
	procedures: proceduresFromInstance(sliceMachineClient),
});

await sliceMachineClient.loadProjectConfig();
await sliceMachineClient.initPlugins();

const { port } = await server.open();

// In the browser (i.e. SM UI)
const client = createRPCClient<ExtractProcedures<typeof server>>({
	serverURL: `http://localhost:${port}`,
});

const { model, errors } = await client.readCustomType({
	id: "foo",
});
