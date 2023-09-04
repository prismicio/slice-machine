import * as t from "io-ts";
import {
	HookError,
	SliceTemplateLibraryReadHookData,
} from "@slicemachine/plugin-kit";
import { BaseManager } from "../BaseManager";
import { DecodeError } from "../../lib/DecodeError";
import { assertPluginsInitialized } from "../../lib/assertPluginsInitialized";
import { decodeHookResult } from "../../lib/decodeHookResult";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

type SliceTemplateLibraryManagerReadReturnType = {
	templates: {
		model: SharedSlice;
		screenshots: Record<string, Buffer>;
	}[];
	errors: (DecodeError | HookError)[];
};

type SliceTemplateLibraryManagerGetReturnType = {
	errors: (DecodeError | HookError)[];
};

type SliceTemplateLibraryManagerGetData = {
	templateIds: string[];
};

export class SliceTemplateLibraryManager extends BaseManager {
	async read(
		args: SliceTemplateLibraryReadHookData,
	): Promise<SliceTemplateLibraryManagerReadReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const isTypeScriptProject = await this.project.checkIsTypeScript();
		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"slice-template-library:read",
			{ ...args, isTypeScriptProject },
		);

		const { data, errors } = decodeHookResult(
			t.type({
				templates: t.array(
					t.type({
						mocks: t.string,
						contents: t.string,
						model: SharedSlice,
						screenshots: t.any,
					}),
				),
			}),
			hookResult,
		);

		console.log({ data, errors, hookResult, t: true });

		return {
			templates: [
				{ mocks: "", model: {}, componentContents: "const a = true;" },
			],
			errors,
		};
	}
	async create(
		args: SliceTemplateLibraryManagerGetData,
	): Promise<SliceTemplateLibraryManagerGetReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		args;
		// const hookReadResult = await this.sliceMachinePluginRunner.callHook(
		// 	"slice-template-library:read",
		// 	args,
		// );

		// const { data, errors } = decodeHookResult(
		// 	t.array(
		// 		t.type({
		// 			model: SharedSlice,
		// 			screenshots: t.any,
		// 		}),
		// 	),
		// 	hookReadResult,
		// );

		// if (errors) {
		// 	return {
		// 		errors,
		// 	};
		// }

		// const { libraries } = await this.slices.readAllSliceLibraries();
		// let newId = data.flat()[0].model.id;
		// libraries.forEach((lib) => {
		// 	if (lib.sliceIDs?.includes(newId)) {
		// 		newId = newId + Math.random();
		// 	}
		// });

		// const hookCreateResult = await this.sliceMachinePluginRunner.callHook(
		// 	"slice:create",
		// 	{
		// 		libraryID: libraries[0].libraryID,
		// 		model: { ...data.flat()[0].model, id: newId },
		// 	},
		// );

		// if (hookCreateResult.errors) {
		// 	return {
		// 		errors: hookCreateResult.errors,
		// 	};
		// }

		return {
			errors: [],
		};
	}
}
