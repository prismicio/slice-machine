import * as t from "io-ts";
import {
	HookError,
	DocumentationReadHookData,
	Documentation,
} from "@slicemachine/plugin-kit";
import { BaseManager } from "../BaseManager";
import { DecodeError } from "../../lib/DecodeError";
import { assertPluginsInitialized } from "../../lib/assertPluginsInitialized";
import { decodeHookResult } from "../../lib/decodeHookResult";

type DocumentationManagerReadReturnType = {
	documentation: Documentation[];
	errors: (DecodeError | HookError)[];
};

const documentationCodec = t.intersection([
	t.type({ content: t.string }),
	t.partial({
		label: t.string,
	}),
]);

export class DocumentationManager extends BaseManager {
	async read(
		args: DocumentationReadHookData,
	): Promise<DocumentationManagerReadReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);
		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"documentation:read",
			args,
		);

		const { data, errors } = decodeHookResult(
			t.array(documentationCodec),
			hookResult,
		);

		return {
			documentation: data.flat(),
			errors,
		};
	}
}
