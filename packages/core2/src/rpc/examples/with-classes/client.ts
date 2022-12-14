import { createRPCClient } from "@slicemachine/rpc";
import type { Procedures } from "./rpc-middleware";

const client = createRPCClient<Procedures>({
	serverURL: "http://localhost:3000/rpc",
});

const pong = await client.ping();
