/**
 * The following code is a modified version of the following sources:
 *
 * 1. `formDataToBlob()` from `jimmywarting/FormData` on GitHub
 *
 *    Source:
 *    https://github.com/jimmywarting/FormData/blob/820421ba9ee291cbf6b1b21aaa14ae1846d7c66c/formdata-to-blob.js
 *
 *    MIT License
 *
 *    Copyright (c) 2016 Jimmy Karl Roland Wärting
 *
 *    Permission is hereby granted, free of charge, to any person obtaining a copy
 *    of this software and associated documentation files (the "Software"), to
 *    deal in the Software without restriction, including without limitation the
 *    rights to use, copy, modify, merge, publish, distribute, sublicense,
 *    and/or sell copies of the Software, and to permit persons to whom the
 *    Software is furnished to do so, subject to the following conditions:
 *
 *    The above copyright notice and this permission notice shall be included in
 *    all copies or substantial portions of the Software.
 *
 *    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 *    THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 *    DEALINGS IN THE SOFTWARE.
 * 2. `readStream()` from `octet-stream/form-data-encoder` on GitHub.
 *
 *    Source:
 *    https://github.com/octet-stream/form-data-encoder/blob/f884063dc10fccd718af8864fbd62ee860ccf9f5/src/util/getStreamIterator.ts
 *
 *    The MIT License (MIT)
 *
 *    Copyright (c) 2021-present Nick K.
 *
 *    Permission is hereby granted, free of charge, to any person obtaining a copy
 *    of this software and associated documentation files (the "Software"), to
 *    deal in the Software without restriction, including without limitation the
 *    rights to use, copy, modify, merge, publish, distribute, sublicense,
 *    and/or sell copies of the Software, and to permit persons to whom the
 *    Software is furnished to do so, subject to the following conditions:
 *
 *    The above copyright notice and this permission notice shall be included in
 *    all copies or substantial portions of the Software.
 *
 *    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 *    THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 *    DEALINGS IN THE SOFTWARE.
 */

import { Readable } from "node:stream";
import { H3Event, sendStream, setHeaders } from "h3";

/**
 * Reads from a given ReadableStream.
 *
 * @param readable - A ReadableStream from which to read.
 */
async function* readStream(
	readable: ReadableStream<Uint8Array>,
): AsyncGenerator<Uint8Array, void, undefined> {
	const reader = readable.getReader();

	while (true) {
		const { done, value } = await reader.read();

		if (done) {
			break;
		}

		yield value;
	}
}

const escape = (str: string, isFilename?: boolean) =>
	(isFilename ? str : str.replace(/\r?\n|\r/g, "\r\n"))
		.replace(/\n/g, "%0A")
		.replace(/\r/g, "%0D")
		.replace(/"/g, "%22");

export const sendFormData = (
	event: H3Event,
	formData: FormData,
): Promise<void> => {
	const boundary = "rpc-" + Math.random();
	const prefix = `--${boundary}\r\nContent-Disposition: form-data;`;

	async function* chunks() {
		for (const [name, value] of formData) {
			if (typeof value === "string") {
				yield `${prefix} name="${escape(name)}"` +
					"\r\n\r\n" +
					value.replace(/\r(?!\n)|(?<!\r)\n/g, "\r\n") +
					"\r\n";
			} else {
				yield `${prefix} name="${escape(name)}"; ` +
					`filename="${escape(value.name, true)}"` +
					"\r\n" +
					`Content-Type: ${value.type || "application/octet-stream"}` +
					"\r\n\r\n";
				yield* readStream(value.stream());
				yield "\r\n";
			}
		}

		yield `--${boundary}--\r\n\r\n`;
	}

	setHeaders(event, {
		"Content-Type": `multipart/form-data; boundary=${boundary}`,
	});

	return sendStream(event, Readable.from(chunks()));
};
