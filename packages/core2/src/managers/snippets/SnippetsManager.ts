import * as t from "io-ts";
import {
	HookError,
	Snippet,
	SnippetReadHookData,
} from "@slicemachine/plugin-kit";

import { DecodeError } from "../../lib/DecodeError";
import { assertPluginsInitialized } from "../../lib/assertPluginsInitialized";
import { decodeHookResult } from "../../lib/decodeHookResult";

import { BaseManager } from "../BaseManager";

const snippetCodec = t.type({
	label: t.string,
	language: t.string,
	code: t.string,
});

type SnippetsMangerUpdateSliceReturnType = {
	snippets: Snippet[];
	errors: (DecodeError | HookError)[];
};

export class SnippetsManager extends BaseManager {
	async readSnippets(
		args: SnippetReadHookData,
	): Promise<SnippetsMangerUpdateSliceReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"snippet:read",
			args,
		);
		const { data, errors } = decodeHookResult(
			t.union([snippetCodec, t.array(snippetCodec)]),
			hookResult,
		);

		return {
			snippets: data.flat(),
			errors,
		};
	}
}
