import fetch from "node-fetch";

import {
	createClient,
	CustomTypesClient,
	CustomTypesClientConfig,
	CustomTypesClientMethodParams,
} from "@prismicio/custom-types-client";
import type * as prismicT from "@prismicio/types";

import { APIEndpoints } from "@slicemachine/misc";

type CustomTypesAPIClientConstructorArgs = Pick<
	CustomTypesClientConfig,
	"repositoryName" | "token"
>;

type CustomTypesAPIClientMethodParams = Pick<
	CustomTypesClientMethodParams,
	"repositoryName" | "token"
>;

type CustomTypesAPIClientGetCustomTypeByIDParams =
	CustomTypesAPIClientMethodParams & {
		id: string;
	};

type CustomTypesAPIClientInsertCustomTypeParams =
	CustomTypesAPIClientMethodParams & {
		model: prismicT.CustomTypeModel;
	};

type CustomTypesAPIClientUpdateCustomTypeParams =
	CustomTypesAPIClientMethodParams & {
		model: prismicT.CustomTypeModel;
	};

type CustomTypesAPIClientRemoveCustomTypeParams =
	CustomTypesAPIClientMethodParams & {
		id: string;
	};

type CustomTypesAPIClientGetSharedSliceByIDParams =
	CustomTypesAPIClientMethodParams & {
		id: string;
	};

type CustomTypesAPIClientInsertSharedSliceParams =
	CustomTypesAPIClientMethodParams & {
		model: prismicT.SharedSliceModel;
	};

type CustomTypesAPIClientUpdateSharedSliceParams =
	CustomTypesAPIClientMethodParams & {
		model: prismicT.SharedSliceModel;
	};

type CustomTypesAPIClientRemoveSharedSliceParams =
	CustomTypesAPIClientMethodParams & {
		id: string;
	};

export class CustomTypesAPIClient {
	private _client: CustomTypesClient;

	constructor(args: CustomTypesAPIClientConstructorArgs) {
		this._client = createClient({
			repositoryName: args.repositoryName,
			token: args.token,
			endpoint: APIEndpoints.PrismicModels,
			fetch,
		});
	}

	async getAllCustomTypes(
		args?: CustomTypesAPIClientMethodParams,
	): Promise<prismicT.CustomTypeModel[]> {
		const customTypes = await this._client.getAllCustomTypes(args);

		// TODO: Validate

		return customTypes;
	}

	async getCustomTypeByID(
		args: CustomTypesAPIClientGetCustomTypeByIDParams,
	): Promise<prismicT.CustomTypeModel> {
		const { id, ...params } = args;

		const customType = await this._client.getCustomTypeByID(id, params);

		// TODO: Validate

		return customType;
	}

	async insertCustomType(
		args: CustomTypesAPIClientInsertCustomTypeParams,
	): Promise<void> {
		const { model, ...params } = args;

		await this._client.insertCustomType(model, params);
	}

	async updateCustomType(
		args: CustomTypesAPIClientUpdateCustomTypeParams,
	): Promise<void> {
		const { model, ...params } = args;

		await this._client.updateCustomType(model, params);
	}

	async removeCustomType(
		args: CustomTypesAPIClientRemoveCustomTypeParams,
	): Promise<void> {
		const { id, ...params } = args;

		await this._client.removeCustomType(id, params);
	}

	async getAllSharedSlices(
		args?: CustomTypesAPIClientMethodParams,
	): Promise<prismicT.SharedSliceModel[]> {
		const sharedSlices = await this._client.getAllSharedSlices(args);

		// TODO: Validate

		return sharedSlices;
	}

	async getSharedSliceByID(
		args: CustomTypesAPIClientGetSharedSliceByIDParams,
	): Promise<prismicT.SharedSliceModel> {
		const { id, ...params } = args;

		const sharedSlice = await this._client.getSharedSliceByID(id, params);

		// TODO: Validate

		return sharedSlice;
	}

	async insertSharedSlice(
		args: CustomTypesAPIClientInsertSharedSliceParams,
	): Promise<void> {
		const { model, ...params } = args;

		await this._client.insertSharedSlice(model, params);
	}

	async updateSharedSlice(
		args: CustomTypesAPIClientUpdateSharedSliceParams,
	): Promise<void> {
		const { model, ...params } = args;

		await this._client.updateSharedSlice(model, params);
	}

	async removeSharedSlice(
		args: CustomTypesAPIClientRemoveSharedSliceParams,
	): Promise<void> {
		const { id, ...params } = args;

		await this._client.removeSharedSlice(id, params);
	}
}
