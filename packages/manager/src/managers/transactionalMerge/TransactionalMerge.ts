import { SliceMachineError } from "../../errors";
import { BaseManager } from "../BaseManager";
import { SliceMachineManager } from "../SliceMachineManager";
import {
	AllChangeTypes,
	BulkBody,
	ChangeTypes,
	ClientError,
	Limit,
	LimitType,
	RawLimit,
} from "./types";
import fetch from "node-fetch";
import * as t from "io-ts";
import { fold } from "fp-ts/Either";

type TransactionalMergeArgs = {
	confirmDeleteDocuments: boolean;
	changes: {
		id: string;
		type: "Slice" | "CustomType";
		operation: "create" | "change" | "delete";
	}[];
};

type TransactionalMergeReturnType = Limit | null;

export class TransactionalMergeManager extends BaseManager {
	constructor(sliceMachineManager: SliceMachineManager) {
		super(sliceMachineManager);

		if (!sliceMachineManager.getPrismicAuthManager()) {
			throw new SliceMachineError(
				"SliceMachineManager._prismicAuthManager must be set with a PrismicAuthManager instance before instantiating TransactionalMergeManager.",
			);
		}
	}

	async pushChanges(
		args: TransactionalMergeArgs,
	): Promise<TransactionalMergeReturnType> {
		try {
			const allChanges: AllChangeTypes[] = await Promise.all(
				args.changes.map(async (change) => {
					if (change.type === "Slice") {
						switch (change.operation) {
							case "create": {
								const { model } = await this.slices.readSlice({
									libraryID: "./slices",
									sliceID: change.id,
								});

								if (!model) {
									// TODO: This can be undefined but types don't catch it
									throw Error("Could not find model ${change.id}");
								}

								return {
									type: ChangeTypes.SLICE_INSERT,
									id: change.id,
									payload: model,
								};
							}
							case "change": {
								const { model } = await this.slices.readSlice({
									libraryID: "./slices",
									sliceID: change.id,
								});

								if (!model) {
									// TODO: This can be undefined but types don't catch it
									throw Error("Could not find model");
								}

								return {
									type: ChangeTypes.SLICE_UPDATE,
									id: change.id,
									payload: model,
								};
							}
							case "delete":
								return {
									id: change.id,
									payload: { id: change.id },
									type: ChangeTypes.SLICE_DELETE,
								};
						}
					} else {
						switch (change.operation) {
							case "create": {
								const { model } = await this.customTypes.readCustomType({
									id: change.id,
								});
								if (!model) {
									throw Error(`Could not find model ${change.id}`);
								}

								return {
									type: ChangeTypes.CUSTOM_TYPE_INSERT,
									id: change.id,
									payload: model,
								};
							}
							case "change": {
								const { model } = await this.customTypes.readCustomType({
									id: change.id,
								});
								if (!model) {
									throw Error("Could not find model");
								}

								return {
									type: ChangeTypes.CUSTOM_TYPE_UPDATE,
									id: change.id,
									payload: model,
								};
							}
							case "delete":
								return {
									id: change.id,
									payload: { id: change.id },
									type: ChangeTypes.CUSTOM_TYPE_DELETE,
								};
						}
					}
				}),
			);

			// Compute the POST body
			const requestBody: BulkBody = {
				confirmDeleteDocuments: args.confirmDeleteDocuments,
				changes: allChanges,
			};

			const authenticationToken = await this.user.getAuthenticationToken();
			const sliceMachineConfig = await this.project.getSliceMachineConfig();

			// return fetch(`${API_ENDPOINTS.PrismicModels}bulk`, { // TODO: use the right endpoint (this ends in /customtypes)
			return fetch("https://customtypes.prismic.io/bulk", {
				body: JSON.stringify(requestBody),
				method: "POST",
				headers: {
					Authorization: `Bearer ${authenticationToken}`,
					"User-Agent": "slice-machine",
					repository: sliceMachineConfig.repositoryName,
					"Content-Type": "application/json",
				},
			})
				.then((response) => {
					if (response.status === 204) {
						return null;
					}

					return this._decodeLimitOrThrow(
						response.json(),
						response.status,
						LimitType.SOFT,
					);
				})
				.catch((err: ClientError) => {
					// Try to decode a limit from the error or throw the original error
					try {
						const data: unknown = JSON.parse(err.message);

						return this._decodeLimitOrThrow(data, err.status, LimitType.HARD);
					} catch {
						throw err;
					}
				});
		} catch (err) {
			console.error("An error happened while pushing your changes");
			console.error(err);

			throw err;
		}
	}

	private _decodeLimitOrThrow(
		potentialLimit: unknown,
		statusCode: number,
		limitType: LimitType,
	): Limit | null {
		return fold<t.Errors, RawLimit, Limit | null>(
			() => {
				const error: ClientError = {
					status: statusCode,
					message: `Unable to parse raw limit from ${JSON.stringify(
						potentialLimit,
					)}`,
				};
				throw error;
			},
			(rawLimit: RawLimit) => {
				const limit = { ...rawLimit, type: limitType };

				return limit;
			},
		)(RawLimit.decode(potentialLimit));
	}
}
