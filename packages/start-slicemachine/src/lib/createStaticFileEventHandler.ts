import * as fsSync from "node:fs";
import { eventHandler, EventHandler, sendStream } from "h3";

export const createStaticFileEventHandler = (
	path: string,
): EventHandler<void> => {
	return eventHandler(async (event) => {
		return sendStream(event, fsSync.createReadStream(path));
	});
};
