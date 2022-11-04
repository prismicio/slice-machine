import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

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
	const address = await new Promise<AddressInfo>((resolve) => {
		server.once("listening", () => {
			resolve(server.address() as AddressInfo);
		});

		server.listen({ port: config.port });
	});

	const close = async () => {
		await new Promise<void>((resolve) => {
			server.once("close", () => {
				resolve();
			});

			server.close();
		});
	};

	return {
		address,
		close,
	};
};
