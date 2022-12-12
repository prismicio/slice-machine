import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

type ListeningServer = {
	/**
	 * Metadata that can be used to access the server.
	 */
	address: AddressInfo;

	/**
	 * Closes the server.
	 */
	close: () => Promise<void>;
};

type ListenConfig = {
	/**
	 * The port on which to listen. If no port is provided, a random available
	 * port will be used.
	 */
	port?: number;
};

/**
 * Listens to a standard `node:http` server.
 *
 * @param server - The server to listen to.
 * @param config - Configuration for the listener.
 *
 * @returns Metadata and controls for the server.
 */
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
			return await new Promise<void>((resolve) => {
				server.once("close", () => {
					resolve();
				});

				server.close();
			});
		},
	};
};
