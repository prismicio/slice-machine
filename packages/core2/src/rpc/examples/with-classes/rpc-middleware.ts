import {
	createRPCMiddleware,
	proceduresFromInstance,
	ExtractProcedures,
} from "@slicemachine/rpc";

class MyProcedures {
	count = 0;

	increment() {
		return ++this.count;
	}
}

export const middleware = createRPCMiddleware({
	procedures: proceduresFromInstance(new MyProcedures()),
});

// This type will be passed to the RPC client.
export type Procedures = ExtractProcedures<typeof middleware>;
