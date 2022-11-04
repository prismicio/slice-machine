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
