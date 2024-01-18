import { SetupServer } from "msw/lib/node";
import { rest } from "msw";

import { SliceMachineManager } from "../../src";

type MockOptions = {
	method?: keyof typeof rest;
	statusCode?: number;
	checkAuthentication?: boolean;
	searchParams?: Record<string, string>;
	body?: SerializableValue;
};

export type SerializableValueObject = { [Key in string]: SerializableValue } & {
	[Key in string]?: SerializableValue | undefined;
};
export type SerializableValueArray =
	| SerializableValue[]
	| readonly SerializableValue[];
export type SerializableValuePrimitive =
	| string
	| number
	| boolean
	| Date
	| null;
export type SerializableValue =
	| SerializableValuePrimitive
	| SerializableValueObject
	| SerializableValueArray;

export type APIFixture = {
	[P in keyof ReturnType<
		SliceMachineManager["getAPIEndpoints"]
	> as `mock${P}`]: (
		path: string,
		response?: SerializableValue,
		options?: MockOptions,
	) => void;
};

export const createAPIFixture = (args: {
	manager: SliceMachineManager;
	mswServer: SetupServer;
}): APIFixture => {
	const apiEndpoints = args.manager.getAPIEndpoints();

	const api = {} as APIFixture;

	for (const key in apiEndpoints) {
		api[`mock${key}` as keyof typeof api] = (path, response, options) => {
			const apiEndpoint = apiEndpoints[key as keyof typeof apiEndpoints];
			const method = options?.method ?? "get";

			const handler = rest[method](
				new URL(path, apiEndpoint).toString(),
				async (req, res, ctx) => {
					// TODO: Enable by default after fixing "Error [ERR_STREAM_PREMATURE_CLOSE]: Premature close" error.
					if (options?.checkAuthentication) {
						const authenticationToken =
							await args.manager.user.getAuthenticationToken();
						if (
							req.headers.get("Authorization") !==
							`Bearer ${authenticationToken}`
						) {
							return;
						}
					}

					if (options?.searchParams) {
						for (const name in options.searchParams) {
							if (
								req.url.searchParams.get(name) !== options.searchParams[name]
							) {
								return;
							}
						}
					}

					if (options?.body) {
						if (
							JSON.stringify(await req.json()) !== JSON.stringify(options.body)
						) {
							return;
						}
					}

					return res(
						typeof response === "object"
							? ctx.json(response)
							: ctx.body(response),
						ctx.status(options?.statusCode ?? 200),
					);
				},
			);

			args.mswServer.use(handler);
		};
	}

	return api;
};
