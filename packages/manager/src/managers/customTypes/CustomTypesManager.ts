import * as t from "io-ts";
import * as prismicCustomTypesClient from "@prismicio/custom-types-client";
import {
	CustomType,
	Group,
	LinkConfig,
	NestableWidget,
	NestedGroup,
	SharedSlice,
	UID,
	traverseCustomType,
	traverseSharedSlice,
} from "@prismicio/types-internal/lib/customtypes";
import {
	CallHookReturnType,
	CustomTypeCreateHook,
	CustomTypeCreateHookData,
	CustomTypeReadHookData,
	CustomTypeRenameHook,
	CustomTypeRenameHookData,
	CustomTypeUpdateHook,
	CustomTypeUpdateHookData,
	HookError,
} from "@slicemachine/plugin-kit";
import { z } from "zod";
import { query as queryClaude } from "@anthropic-ai/claude-agent-sdk";

import { DecodeError } from "../../lib/DecodeError";
import { assertPluginsInitialized } from "../../lib/assertPluginsInitialized";
import { decodeHookResult } from "../../lib/decodeHookResult";
import fetch from "../../lib/fetch";

import { OnlyHookErrors } from "../../types";
import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";
import { SLICE_MACHINE_USER_AGENT } from "../../constants/SLICE_MACHINE_USER_AGENT";
import { UnauthorizedError } from "../../errors";
import { mkdtemp, readFile, rename, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { randomUUID } from "crypto";
import { existsSync } from "fs";

import { BaseManager } from "../BaseManager";
import { CustomTypeFormat } from "./types";

type SliceMachineManagerReadCustomTypeLibraryReturnType = {
	ids: string[];
	errors: (DecodeError | HookError)[];
};

type CustomTypesManagerReadAllCustomTypesArgs = {
	format: CustomTypeFormat;
};

type SliceMachineManagerReadAllCustomTypeReturnType = {
	models: { model: CustomType }[];
	errors: (DecodeError | HookError)[];
};

type SliceMachineManagerReadCustomTypeReturnType = {
	model: CustomType | undefined;
	errors: (DecodeError | HookError)[];
};

type SliceMachineManagerPushCustomTypeArgs = {
	id: string;
	userAgent?: string;
};

type SliceMachineManagerReadCustomTypeMocksConfigArgs = {
	customTypeID: string;
};

type SliceMachineManagerReadCustomTypeMocksConfigArgsReturnType = {
	// TODO
	mocksConfig?: Record<string, unknown>;
	errors: HookError[];
};

type SliceMachineManagerUpdateCustomTypeMocksConfigArgs = {
	customTypeID: string;
	// TODO
	mocksConfig: Record<string, unknown>;
};

/** `[field]` or `[group, field]` – path **inside** the Custom Type */
type PathWithoutCustomType = [string] | [string, string];

type SliceMachineManagerUpdateCustomTypeFieldIdChanged = {
	/**
	 * Previous path of the changed field, excluding the custom type id. Can be
	 * used to identify the field that had an API ID rename (e.g. ["fieldA"] or
	 * ["groupA", "fieldA"])
	 */
	previousPath: PathWithoutCustomType;
	/**
	 * New path of the changed field, excluding the custom type id. Can be used to
	 * identify the field that had an API ID rename (e.g. ["fieldB"] or ["groupA",
	 * "fieldB"])
	 */
	newPath: PathWithoutCustomType;
};

type SliceMachineManagerUpdateCustomTypeArgs = CustomTypeUpdateHookData & {
	updateMeta?: {
		fieldIdChanged?: SliceMachineManagerUpdateCustomTypeFieldIdChanged;
	};
};

type SliceMachineManagerUpdateCustomTypeMocksConfigArgsReturnType = {
	errors: HookError[];
};

type CustomTypesMachineManagerDeleteCustomTypeArgs = {
	id: string;
};

type CustomTypesMachineManagerDeleteCustomTypeReturnType = {
	errors: (DecodeError | HookError)[];
};

type CustomTypesMachineManagerUpdateCustomTypeReturnType = {
	errors: (DecodeError | HookError)[];
};

/** `[ct, field]` or `[ct, group, field]` – path **with** Custom Type ID */
type PathWithCustomType = [string, string] | [string, string, string];

type CustomTypeFieldIdChangedMeta = {
	previousPath: PathWithCustomType;
	newPath: PathWithCustomType;
};

type LinkCustomType = NonNullable<LinkConfig["customtypes"]>[number];

export class CustomTypesManager extends BaseManager {
	async readCustomTypeLibrary(): Promise<SliceMachineManagerReadCustomTypeLibraryReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"custom-type-library:read",
			undefined,
		);
		const { data, errors } = decodeHookResult(
			t.type({
				ids: t.array(t.string),
			}),
			hookResult,
		);

		return {
			ids: data[0]?.ids || [],
			errors,
		};
	}

	async readAllCustomTypes(
		args?: CustomTypesManagerReadAllCustomTypesArgs,
	): Promise<SliceMachineManagerReadAllCustomTypeReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const res: SliceMachineManagerReadAllCustomTypeReturnType = {
			models: [],
			errors: [],
		};

		const { ids, errors } = await this.readCustomTypeLibrary();
		res.errors = [...res.errors, ...errors];

		if (ids) {
			for (const id of ids) {
				const { model, errors } = await this.readCustomType({ id });
				res.errors = [...res.errors, ...errors];

				if (model && (!args || args.format === model.format)) {
					res.models.push({ model });
				}
			}
		}

		return res;
	}

	async createCustomType(
		args: CustomTypeCreateHookData,
	): Promise<OnlyHookErrors<CallHookReturnType<CustomTypeCreateHook>>> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"custom-type:create",
			args,
		);

		return {
			errors: hookResult.errors,
		};
	}

	async readCustomType(
		args: CustomTypeReadHookData,
	): Promise<SliceMachineManagerReadCustomTypeReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"custom-type:read",
			args,
		);
		const { data, errors } = decodeHookResult(
			t.type({
				model: CustomType,
			}),
			hookResult,
		);

		return {
			model: data[0]?.model,
			errors,
		};
	}

	/**
	 * Update the Content Relationship API IDs for all existing custom types and
	 * slices. The change is determined by properties inside the `updateMeta`
	 * property.
	 */
	private async updateContentRelationships(
		args: {
			model: CustomType;
		} & SliceMachineManagerUpdateCustomTypeFieldIdChanged,
	): Promise<
		OnlyHookErrors<CallHookReturnType<CustomTypeUpdateHook>> & {
			rollback?: () => Promise<void>;
		}
	> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const {
			model,
			previousPath: previousFieldPath,
			newPath: newFieldPath,
		} = args;

		if (previousFieldPath.join(".") !== newFieldPath.join(".")) {
			const { id: ctId } = model;
			const previousPath: PathWithCustomType = [ctId, ...previousFieldPath];
			const newPath: PathWithCustomType = [ctId, ...newFieldPath];

			const crUpdates: {
				updatePromise: Promise<{ errors: HookError[] }>;
				rollback: () => void;
			}[] = [];

			// Find existing content relationships that link to the renamed field id in
			// any custom type and update them to use the new one.
			const customTypes = await this.readAllCustomTypes();

			updateCustomTypeContentRelationships({
				models: customTypes.models,
				onUpdate: ({ previousModel, model: updatedModel }) => {
					assertPluginsInitialized(this.sliceMachinePluginRunner);

					crUpdates.push({
						updatePromise: this.sliceMachinePluginRunner?.callHook(
							"custom-type:update",
							{ model: updatedModel },
						),
						rollback: () => {
							this.sliceMachinePluginRunner?.callHook("custom-type:update", {
								model: previousModel,
							});
						},
					});
				},
				previousPath,
				newPath,
			});

			// Find existing slice with content relationships that link to the renamed
			// field id in all libraries and update them to use the new one.
			const { libraries } = await this.slices.readAllSliceLibraries();

			for (const library of libraries) {
				const slices = await this.slices.readAllSlicesForLibrary({
					libraryID: library.libraryID,
				});

				updateSharedSliceContentRelationships({
					models: slices.models,
					onUpdate: ({ previousModel, model: updatedModel }) => {
						assertPluginsInitialized(this.sliceMachinePluginRunner);

						crUpdates.push({
							updatePromise: this.sliceMachinePluginRunner?.callHook(
								"slice:update",
								{ libraryID: library.libraryID, model: updatedModel },
							),
							rollback: () => {
								this.sliceMachinePluginRunner?.callHook("slice:update", {
									libraryID: library.libraryID,
									model: previousModel,
								});
							},
						});
					},
					previousPath,
					newPath,
				});
			}

			// Process all the Content Relationship updates at once.
			const crUpdatesResult = await Promise.all(
				crUpdates.map((update) => update.updatePromise),
			);

			if (crUpdatesResult.some((result) => result.errors.length > 0)) {
				return {
					errors: crUpdatesResult.flatMap((result) => result.errors),
					rollback: async () => {
						await Promise.all(crUpdates.map((update) => update.rollback()));
					},
				};
			}
		}

		return { errors: [] };
	}

	async updateCustomType(
		args: SliceMachineManagerUpdateCustomTypeArgs,
	): Promise<CustomTypesMachineManagerUpdateCustomTypeReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);
		const { model } = args;
		const { fieldIdChanged } = args.updateMeta ?? {};

		let previousCustomType: CustomType | undefined;

		if (fieldIdChanged) {
			const customTypeRead = await this.readCustomType({ id: model.id });

			if (customTypeRead.errors.length > 0) {
				return { errors: customTypeRead.errors };
			}
			if (!customTypeRead.model) {
				throw new Error(
					`readCustomType succeeded reading custom type ${model.id} but model is undefined.`,
				);
			}

			previousCustomType = customTypeRead.model;
		}

		const customTypeUpdateResult = await this.sliceMachinePluginRunner.callHook(
			"custom-type:update",
			{ model },
		);

		if (customTypeUpdateResult.errors.length > 0) {
			return { errors: customTypeUpdateResult.errors };
		}

		if (previousCustomType && fieldIdChanged) {
			const crUpdateResult = await this.updateContentRelationships({
				...fieldIdChanged,
				model: previousCustomType,
			});

			if (crUpdateResult.errors.length > 0) {
				// put the previous custom type back
				await this.sliceMachinePluginRunner?.callHook("custom-type:update", {
					model: previousCustomType,
				});
				// revert the content relationships updates
				await crUpdateResult.rollback?.();

				return { errors: crUpdateResult.errors };
			}
		}

		return { errors: [] };
	}

	async renameCustomType(
		args: CustomTypeRenameHookData,
	): Promise<OnlyHookErrors<CallHookReturnType<CustomTypeRenameHook>>> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"custom-type:rename",
			args,
		);

		return {
			errors: hookResult.errors,
		};
	}

	async deleteCustomType(
		args: CustomTypesMachineManagerDeleteCustomTypeArgs,
	): Promise<CustomTypesMachineManagerDeleteCustomTypeReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const { model, errors: readCustomTypeErrors } = await this.readCustomType({
			id: args.id,
		});

		if (model) {
			const hookResult = await this.sliceMachinePluginRunner.callHook(
				"custom-type:delete",
				{ model },
			);

			return {
				errors: hookResult.errors,
			};
		} else {
			return {
				errors: readCustomTypeErrors,
			};
		}
	}

	async pushCustomType(
		args: SliceMachineManagerPushCustomTypeArgs,
	): Promise<void> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const authenticationToken = await this.user.getAuthenticationToken();
		const repositoryName = await this.project.getResolvedRepositoryName();

		// TODO: Handle errors
		const { model } = await this.readCustomType({ id: args.id });

		if (model) {
			// TODO: Create a single shared client.
			const client = prismicCustomTypesClient.createClient({
				endpoint: API_ENDPOINTS.PrismicModels,
				repositoryName,
				token: authenticationToken,
				fetch,
				fetchOptions: {
					headers: {
						"User-Agent": args.userAgent || SLICE_MACHINE_USER_AGENT,
					},
				},
			});

			try {
				// Check if Custom Type already exists on the repository.
				await client.getCustomTypeByID(args.id);

				// If it exists on the repository, update it.
				await client.updateCustomType(model);
			} catch (error) {
				if (error instanceof prismicCustomTypesClient.NotFoundError) {
					// If it doesn't exist on the repository, insert it.
					await client.insertCustomType(model);
				} else if (error instanceof prismicCustomTypesClient.ForbiddenError) {
					throw new UnauthorizedError(
						"You do not have access to push types to this Prismic repository.",
						{
							cause: error,
						},
					);
				} else {
					throw error;
				}
			}
		}
	}

	// TODO: Remove
	async readCustomTypeMocksConfig(
		args: SliceMachineManagerReadCustomTypeMocksConfigArgs,
	): Promise<SliceMachineManagerReadCustomTypeMocksConfigArgsReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"custom-type:asset:read",
			{
				customTypeID: args.customTypeID,
				assetID: "mocks.config.json",
			},
		);
		const data = hookResult.data[0]?.data;

		// TODO: Validate the returned data.

		if (data) {
			return {
				mocksConfig: JSON.parse(data.toString()),
				errors: hookResult.errors,
			};
		} else {
			return {
				mocksConfig: undefined,
				errors: hookResult.errors,
			};
		}
	}

	// TODO: Remove
	async updateCustomTypeMocksConfig(
		args: SliceMachineManagerUpdateCustomTypeMocksConfigArgs,
	): Promise<SliceMachineManagerUpdateCustomTypeMocksConfigArgsReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"custom-type:asset:update",
			{
				customTypeID: args.customTypeID,
				asset: {
					id: "mocks.config.json",
					data: Buffer.from(JSON.stringify(args.mocksConfig, null, "\t")),
				},
			},
		);

		return {
			errors: hookResult.errors,
		};
	}

	async fetchRemoteCustomTypes(): Promise<CustomType[]> {
		const authenticationToken = await this.user.getAuthenticationToken();
		const repositoryName = await this.project.getResolvedRepositoryName();

		const client = prismicCustomTypesClient.createClient({
			endpoint: API_ENDPOINTS.PrismicModels,
			repositoryName,
			token: authenticationToken,
			fetch,
			fetchOptions: {
				headers: {
					"User-Agent": SLICE_MACHINE_USER_AGENT,
				},
			},
		});

		return await client.getAllCustomTypes();
	}

	async inferSlice(
		args: { imageUrl: string } & (
			| { source: "upload" }
			| { source: "figma"; libraryID: string }
		),
	): Promise<InferSliceResponse> {
		const { source, imageUrl } = args;
		const authToken = await this.user.getAuthenticationToken();

		if (source === "figma") {
			const { libraryID } = args;
			// eslint-disable-next-line no-console
			console.log(`inferSlice started`);
			const startTime = Date.now();

			let tmpDir: string | undefined;
			try {
				const config = await this.project.getSliceMachineConfig();

				let framework:
					| { type: "nextjs" | "nuxt" | "sveltekit"; label: string }
					| undefined;
				if (config.adapter === "@slicemachine/adapter-next") {
					framework = { type: "nextjs", label: "Next.js (React)" };
				} else if (
					config.adapter === "@slicemachine/adapter-nuxt" ||
					config.adapter === "@slicemachine/adapter-nuxt2"
				) {
					framework = { type: "nuxt", label: "Nuxt (Vue)" };
				} else if (config.adapter === "@slicemachine/adapter-sveltekit") {
					framework = { type: "sveltekit", label: "SvelteKit (Svelte)" };
				}

				if (!framework) {
					throw new Error(
						"Could not determine framework from Slice Machine config.",
					);
				}

				let frameworkFileExtension: string | undefined;
				if (framework.type === "nextjs") {
					frameworkFileExtension = "tsx";
				} else if (framework.type === "nuxt") {
					frameworkFileExtension = "vue";
				} else if (framework.type === "sveltekit") {
					frameworkFileExtension = "svelte";
				}

				if (!frameworkFileExtension) {
					throw new Error(
						"Could not determine framework from Slice Machine config.",
					);
				}

				const projectRoot = await this.project.getRoot();
				const libraryAbsPath = path.join(projectRoot, libraryID);

				tmpDir = await mkdtemp(
					path.join(tmpdir(), "slice-machine-infer-slice-tmp-"),
				);
				const tmpImagePath = path.join(tmpDir, `${randomUUID()}.png`);
				const response = await fetch(imageUrl);
				if (!response.ok) {
					throw new Error(
						`Failed to download image: ${response.status} ${response.statusText}`,
					);
				}
				await writeFile(
					tmpImagePath,
					Buffer.from(await response.arrayBuffer()),
				);

				const queries = queryClaude({
					prompt: `CRITICAL INSTRUCTIONS - READ FIRST:
- You MUST start immediately with Step 1.1. DO NOT read, analyze, or explore any project files first.
- Work step-by-step through the numbered tasks below.
- DO NOT present any summary, explanation, or completion message after finishing.
- DO NOT create TODO lists while performing tasks.
- Keep responses minimal - only show necessary tool calls and brief progress notes.

# CONTEXT 

The user wants to build a new Prismic Slice based on a design image they provided.
Your goal is to analyze the design image and generate the JSON model data and boilerplate code for the slice following Prismic requirements.

You will work under the slice library at <slice_library_path>, where all the slices are stored.

# AVAILABLE RESOURCES

<design_image_path>
${tmpImagePath}
</design_image_path>

<slice_library_path>
${libraryAbsPath}
</slice_library_path>

<framework>
${framework.label}
</framework>

# AVAILABLE TOOLS

You have access to specialized Prismic MCP tools for this task:

<tool name="mcp__prismic__how_to_model_slice">
<description>
Provides detailed guidance on creating Prismic slice models, including field types, naming conventions, and best practices.
</description>
<when_to_use>
Call this tool in Step 2.1 to learn how to structure the slice model data for the design you analysed.
</when_to_use>
</tool>

<tool name="mcp__prismic__how_to_code_slice">
<description>
Provides guidance on implementing Prismic slice components, including how to use Prismic field components, props structure, and best practices.
</description>
<when_to_use>
Call this tool in Step 2.1 to learn how to properly structure the slice component with Prismic fields.
</when_to_use>
</tool>

<tool name="mcp__prismic__save_slice_data">
<description>
Validates and saves the slice model data to model.json. This is the ONLY way to create the model file.
</description>
<when_to_use>
Call this tool in Step 2.3 after you have built the complete slice model structure in memory.
</when_to_use>
</tool>

# TASK REQUIREMENTS

## Step 1: Gather information from the design image
1.1. Analyse the design image at <design_image_path>.
1.2. Identify all elements in the image that should be dynamically editable (e.g., headings, paragraphs, images, links, buttons, etc.).
1.3. List the slice directories under <slice_library_path>.
1.4. Come up with a unique name for the new slice based on the content of the image and the slice directories.

## Step 2: Model the Prismic slice
2.1. Call mcp__prismic__how_to_model_slice to learn how to structure the model for this design.
- Make sure the name you use for the new slice does not yet exist in the slice library at <slice_library_path>. If it does, use a different name.
2.2. Build the complete slice JSON model data in memory based on the guidance received and the information extracted from the image.
2.3. Call mcp__prismic__save_slice_data to save the model (DO NOT manually write model.json) in the slice library at <slice_library_path>.

## Step 3: Code a boilerplate slice component based on the model
3.1. Call mcp__prismic__how_to_code_slice to learn how to properly structure the slice component with Prismic fields.
3.2. Update the slice component code at <slice_library_path>/index.${frameworkFileExtension}, replacing the placeholder code with boilerplate code with the following requirements:
- Must NOT be based on existing slices or components from the codebase.
- Must render all the Prismic components to display the fields of the slice model created at <slice_model_path>.
- Must be a valid ${framework.label} component.
- Must NOT have any styling/CSS. No inlines styles or classNames. Just the skeleton component structure.
- Must NOT use any other custom component or functions from the user's codebase.
- Avoid creating unnecessary wrapper elements, like if they only wrap a single component (e.g., <div><PrismicRichText /></div>).

## Step 4: Present the newly created slice path
4.1. Present the path to the newly created slice in the following format: <new_slice_path>${libraryAbsPath}/MyNewSlice</new_slice_path>.
- "MyNewSlice" must be the name of the directory of the newly created slice.

# EXAMPLE OF CORRECT EXECUTION

<example>
Assistant: Step 1.1: Analysing design image...
[reads <design_image_path>]

Step 1.2: Identifying editable content elements...
[identifies: title field, description field, buttonText field, buttonLink field, backgroundImage field]

Step 1.3: Listing slice directories under <slice_library_path>...
[lists slice directories: Hero, Hero2, Hero3]

Step 1.4: Coming up with a unique name for the new slice...
[comes up with a unique name for the new slice: Hero4]

Step 2.1: Getting Prismic modeling guidance...
[calls mcp__prismic__how_to_model_slice]

Step 2.2: Building slice model based on guidance and the information extracted...
[creates model with title field, description field, buttonText field, buttonLink field, backgroundImage field]

Step 2.3: Saving slice model...
[calls mcp__prismic__save_slice_data]

Step 3.1: Learning Prismic slice coding requirements...
[calls mcp__prismic__how_to_code_slice]

Step 3.2: Coding boilerplate slice component based on the model...
[updates component with Prismic field components, no styling, no other components]

Step 4.1: Presenting the path to the newly created slice...
[presents <new_slice_path>${path.join(
						libraryAbsPath,
						"MyNewSlice",
					)}</new_slice_path>]

# DELIVERABLES
- Slice model saved to <slice_library_path>/model.json using mcp__prismic__save_slice_data
- Slice component at <slice_library_path>/index.${frameworkFileExtension} updated with boilerplate code
- New slice path presented in the format mentioned in Step 3.1

YOU ARE NOT FINISHED UNTIL YOU HAVE THESE DELIVERABLES.

---

FINAL REMINDERS:
- You MUST use mcp__prismic__save_slice_data to save the model
- You MUST call mcp__prismic__how_to_code_slice in Step 3.1
- DO NOT ATTEMPT TO BUILD THE APPLICATION
- START IMMEDIATELY WITH STEP 1.1 - NO PRELIMINARY ANALYSIS;`,
					options: {
						cwd: libraryAbsPath,
						stderr: (data) => console.error(data),
						model: "claude-haiku-4-5",
						permissionMode: "bypassPermissions",
						allowedTools: [
							"Bash",
							"Read",
							"FileSearch",
							"Grep",
							"Glob",
							"Task",
							"Edit",
							"Write",
							"MultiEdit",
							"mcp__prismic__how_to_model_slice",
							"mcp__prismic__how_to_code_slice",
							"mcp__prismic__save_slice_data",
						],
						disallowedTools: [
							`Edit(**/model.json)`,
							`Write(**/model.json)`,
							"Edit(**/mocks.json)",
							"Write(**/mocks.json)",
						],
						env: {
							...process.env,
							ANTHROPIC_BASE_URL: API_ENDPOINTS.LlmProxyTypeService,
							ANTHROPIC_API_KEY: authToken,
						},
						mcpServers: {
							prismic: {
								type: "stdio",
								command: "npx",
								args: ["-y", "@prismicio/mcp-server@0.0.20-alpha.6"],
							},
						},
					},
				});

				let newSliceAbsPath: string | undefined;

				for await (const query of queries) {
					switch (query.type) {
						case "result":
							if (query.subtype === "success") {
								newSliceAbsPath = query.result.match(
									/<new_slice_path>(.*)<\/new_slice_path>/s,
								)?.[1];
							}
							break;
					}
				}

				if (!newSliceAbsPath) {
					throw new Error("Could not find path for the newly created slice.");
				}

				const model = await readFile(
					path.join(newSliceAbsPath, "model.json"),
					"utf8",
				);

				if (!model) {
					throw new Error("Could not find model for the newly created slice.");
				}

				// move the screenshot image to the new slice directory
				await rename(
					tmpImagePath,
					path.join(newSliceAbsPath, "screenshot-default.png"),
				);
				await rm(tmpDir, { recursive: true });

				const elapsedTimeSeconds = (Date.now() - startTime) / 1000;
				// eslint-disable-next-line no-console
				console.log(`inferSlice took ${elapsedTimeSeconds}s`);

				return InferSliceResponse.parse({ slice: JSON.parse(model) });
			} catch (error) {
				if (tmpDir && existsSync(tmpDir)) {
					await rm(tmpDir, { recursive: true });
				}

				throw error;
			}
		} else {
			const headers = {
				Authorization: `Bearer ${authToken}`,
			};

			const repository = await this.project.getResolvedRepositoryName();
			const searchParams = new URLSearchParams({
				repository,
			});

			const url = new URL("./slices/infer", API_ENDPOINTS.CustomTypeService);
			url.search = searchParams.toString();

			const response = await fetch(url.toString(), {
				method: "POST",
				headers: headers,
				body: JSON.stringify({ imageUrl }),
			});

			if (!response.ok) {
				throw new Error(`Failed to infer slice: ${response.statusText}`);
			}

			const json = await response.json();

			return InferSliceResponse.parse(json);
		}
	}
}

type InferSliceResponse = z.infer<typeof InferSliceResponse>;

const InferSliceResponse = z.object({
	slice: z.custom().transform((value, ctx) => {
		const result = SharedSlice.decode(value);
		if (result._tag === "Right") {
			return result.right;
		}
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: `Invalid shared slice: ${JSON.stringify(value, null, 2)}`,
		});

		return z.NEVER;
	}),
	langSmithUrl: z.string().url().optional(),
});

function updateCRCustomType(
	args: { customType: LinkCustomType } & CustomTypeFieldIdChangedMeta,
): LinkCustomType {
	const previousPath = getPathIds(args.previousPath);
	const newPath = getPathIds(args.newPath);

	if (!previousPath.customTypeId || !newPath.customTypeId) {
		throw new Error(
			`Could not find a customtype id in previousPath (${args.previousPath.join(
				".",
			)}) and/or newPath (${args.newPath.join(
				".",
			)}), which should not be possible.`,
		);
	}

	if (!previousPath.fieldId || !newPath.fieldId) {
		throw new Error(
			`Could not find a field id in previousPath (${args.previousPath.join(
				".",
			)}) and/or newPath (${args.newPath.join(
				".",
			)}), which should not be possible.`,
		);
	}

	const customType = shallowCloneIfObject(args.customType);

	if (typeof customType === "string") {
		// Legacy format support, we don't have anything to update here.
		return customType;
	}

	const matchedCustomTypeId = customType.id === previousPath.customTypeId;

	return {
		...customType,
		fields: customType.fields.map((fieldArg) => {
			const customTypeField = shallowCloneIfObject(fieldArg);

			// Regular field
			if (typeof customTypeField === "string") {
				if (
					matchedCustomTypeId &&
					customTypeField === previousPath.fieldId &&
					customTypeField !== newPath.fieldId
				) {
					// The id of the field has changed.
					return newPath.fieldId;
				}

				return customTypeField;
			}

			if (
				matchedCustomTypeId &&
				customTypeField.id === previousPath.fieldId &&
				customTypeField.id !== newPath.fieldId
			) {
				// The id of the field has changed. We don't exit return because there
				// might be other fields further down in nested custom types or groups
				// that need to be updated.
				customTypeField.id = newPath.fieldId;
			}

			// Group field
			if ("fields" in customTypeField) {
				if (
					!previousPath.groupId &&
					!newPath.groupId &&
					customTypeField.id === previousPath.fieldId &&
					customTypeField.id !== newPath.fieldId
				) {
					// Only the id of the group has changed. Group id is not defined, so
					// we can return early.
					return newPath.fieldId;
				}

				const matchedGroupId = customTypeField.id === previousPath.groupId;

				if (
					previousPath.groupId &&
					newPath.groupId &&
					matchedGroupId &&
					customTypeField.id !== newPath.groupId
				) {
					// The id of the group field has changed, so we update it. We don't
					// return because there are group fields that may need to be updated.
					customTypeField.id = newPath.groupId;
				}

				return {
					...customTypeField,
					fields: customTypeField.fields.map((groupFieldArg) => {
						const groupField = shallowCloneIfObject(groupFieldArg);

						// Regular field inside a group field
						if (typeof groupField === "string") {
							if (
								matchedGroupId &&
								groupField === previousPath.fieldId &&
								groupField !== newPath.fieldId
							) {
								// The id of the field inside the group has changed.
								return newPath.fieldId;
							}

							return groupField;
						}

						// Content relationship field inside a group field
						return {
							...groupField,
							fields: updateContentRelationshipFields({
								customtypes: groupField.customtypes,
								previousPath,
								newPath,
							}),
						};
					}),
				};
			}

			// Content relationship field
			return {
				...customTypeField,
				customtypes: updateContentRelationshipFields({
					customtypes: customTypeField.customtypes,
					previousPath,
					newPath,
				}),
			};
		}),
	};
}

function updateContentRelationshipFields(args: {
	customtypes: readonly (
		| string
		| {
				id: string;
				fields: readonly (string | { id: string; fields: readonly string[] })[];
		  }
	)[];
	previousPath: CrUpdatePathIds;
	newPath: CrUpdatePathIds;
}) {
	const { customtypes, previousPath, newPath } = args;

	return customtypes.map((nestedCtArg) => {
		const nestedCt = shallowCloneIfObject(nestedCtArg);

		if (
			typeof nestedCt === "string" ||
			// Since we are entering a new custom type, if the previous id
			// doesn't match, we can return early, because it's not the
			// custom type we are looking for.
			nestedCt.id !== previousPath.customTypeId
		) {
			return nestedCt;
		}

		return {
			...nestedCt,
			fields: nestedCt.fields.map((nestedCtFieldArg) => {
				const nestedCtField = shallowCloneIfObject(nestedCtFieldArg);

				// Regular field
				if (typeof nestedCtField === "string") {
					if (
						nestedCtField === previousPath.fieldId &&
						nestedCtField !== newPath.fieldId
					) {
						// The id of the field has changed.
						return newPath.fieldId;
					}

					return nestedCtField;
				}

				// Group field

				if (
					nestedCtField.id === previousPath.fieldId &&
					nestedCtField.id !== newPath.fieldId
				) {
					// The id of the field has changed.
					nestedCtField.id = newPath.fieldId;
				}

				// Further down the path, the field can only be a group field. So if we have
				// no group id defined, no need to continue.
				if (
					!previousPath.groupId ||
					!newPath.groupId ||
					nestedCtField.id !== previousPath.groupId
				) {
					return nestedCtField;
				}

				if (nestedCtField.id !== newPath.groupId) {
					// The id of the group has changed.
					nestedCtField.id = newPath.groupId;
				}

				return {
					...nestedCtField,
					fields: nestedCtField.fields.map((nestedCtGroupFieldId) => {
						if (
							nestedCtGroupFieldId === previousPath.fieldId &&
							nestedCtGroupFieldId !== newPath.fieldId
						) {
							// The id of the field inside the group has changed.
							return newPath.fieldId;
						}

						return nestedCtGroupFieldId;
					}),
				};
			}),
		};
	});
}

/**
 * Update the Content Relationship API IDs of a single field. The change is
 * determined by the `previousPath` and `newPath` properties.
 */
function updateFieldContentRelationships<
	T extends UID | NestableWidget | Group | NestedGroup,
>(args: { field: T } & CustomTypeFieldIdChangedMeta): T {
	const { field, ...updateMeta } = args;
	if (
		field.type !== "Link" ||
		field.config?.select !== "document" ||
		!field.config?.customtypes
	) {
		// not a content relationship field
		return field;
	}

	const newCustomTypes = field.config.customtypes.map((customType) => {
		return updateCRCustomType({ ...updateMeta, customType });
	});

	return {
		...field,
		config: { ...field.config, customtypes: newCustomTypes },
	};
}

export function updateCustomTypeContentRelationships(
	args: {
		models: { model: CustomType }[];
		onUpdate: (model: { previousModel: CustomType; model: CustomType }) => void;
	} & CustomTypeFieldIdChangedMeta,
): void {
	const { models, previousPath, newPath, onUpdate } = args;

	for (const { model: customType } of models) {
		const updatedCustomType = traverseCustomType({
			customType,
			onField: ({ field }) => {
				return updateFieldContentRelationships({
					field,
					previousPath,
					newPath,
				});
			},
		});

		if (!isEqualModel(customType, updatedCustomType)) {
			onUpdate({ model: updatedCustomType, previousModel: customType });
		}
	}
}

export function updateSharedSliceContentRelationships(
	args: {
		models: { model: SharedSlice }[];
		onUpdate: (model: {
			previousModel: SharedSlice;
			model: SharedSlice;
		}) => void;
	} & CustomTypeFieldIdChangedMeta,
): void {
	const { models, previousPath, newPath, onUpdate } = args;

	for (const { model: slice } of models) {
		const updateSlice = traverseSharedSlice({
			path: [],
			slice,
			onField: ({ field }) => {
				return updateFieldContentRelationships({
					field,
					previousPath,
					newPath,
				});
			},
		});

		if (!isEqualModel(slice, updateSlice)) {
			onUpdate({ model: updateSlice, previousModel: slice });
		}
	}
}

interface CrUpdatePathIds {
	customTypeId: string;
	groupId: string | undefined;
	fieldId: string;
}

function getPathIds(path: PathWithCustomType): CrUpdatePathIds {
	if (path.length < 2) {
		throw new Error(
			`Unexpected path length ${
				path.length
			}. Expected at least 2 segments (got: ${path.join(".")}).`,
		);
	}

	const [customTypeId, groupOrFieldId, fieldId] = path;

	return {
		customTypeId,
		/**
		 * Id of a changed group. If it's defined, it means that a group or a field
		 * inside a group had its API ID renamed. It's defined when the path has a
		 * third element (e.g. `["customtypeA", "groupA", "fieldA"]`).
		 */
		groupId: fieldId ? groupOrFieldId : undefined,
		fieldId: fieldId || groupOrFieldId,
	};
}

function isEqualModel<T extends CustomType | SharedSlice>(
	modelA: T,
	modelB: T,
): boolean {
	return JSON.stringify(modelA) === JSON.stringify(modelB);
}

function shallowCloneIfObject<T>(value: T): T {
	if (typeof value === "object") {
		return { ...value };
	}

	return value;
}
