import { CustomTypes } from "@prismicio/types-internal";
import * as t from "io-ts";

export enum ChangeTypes {
	SLICE_INSERT = "SLICE_INSERT",
	SLICE_UPDATE = "SLICE_UPDATE",
	SLICE_DELETE = "SLICE_DELETE",
	CUSTOM_TYPE_INSERT = "CUSTOM_TYPE_INSERT",
	CUSTOM_TYPE_UPDATE = "CUSTOM_TYPE_UPDATE",
	CUSTOM_TYPE_DELETE = "CUSTOM_TYPE_DELETE",
}
interface Change {
	type: ChangeTypes;
	id: string;
	payload: Record<string, unknown>;
}
interface DeleteChange extends Change {
	payload: {
		id: Change["id"];
	};
}
export interface SliceInsertChange extends Change {
	type: ChangeTypes.SLICE_INSERT;
	payload: CustomTypes.Widgets.Slices.SharedSlice;
}
export interface SliceUpdateChange extends Change {
	type: ChangeTypes.SLICE_UPDATE;
	payload: CustomTypes.Widgets.Slices.SharedSlice;
}
export interface SliceDeleteChange extends DeleteChange {
	type: ChangeTypes.SLICE_DELETE;
}
export interface CustomTypeInsertChange extends Change {
	type: ChangeTypes.CUSTOM_TYPE_INSERT;
	payload: CustomTypes.CustomType;
}
export interface CustomTypeUpdateChange extends Change {
	type: ChangeTypes.CUSTOM_TYPE_UPDATE;
	payload: CustomTypes.CustomType;
}
export interface CustomTypeDeleteChange extends DeleteChange {
	type: ChangeTypes.CUSTOM_TYPE_DELETE;
}
export type AllChangeTypes =
	| SliceInsertChange
	| SliceUpdateChange
	| SliceDeleteChange
	| CustomTypeInsertChange
	| CustomTypeUpdateChange
	| CustomTypeDeleteChange;
export interface BulkBody extends Record<string, unknown> {
	confirmDeleteDocuments: boolean;
	changes: AllChangeTypes[];
}

export const RawLimit = t.type({
	details: t.type({
		customTypes: t.array(
			t.type({
				id: t.string,
				numberOfDocuments: t.number,
				url: t.string,
			}),
		),
	}),
});
export type RawLimit = t.TypeOf<typeof RawLimit>;
export enum LimitType {
	SOFT = "SOFT",
	HARD = "HARD",
}
export type Limit = RawLimit & {
	type: LimitType;
};

export interface ClientError {
	status: number;
	message: string;
}

type ChangeStatus = "NEW" | "MODIFIED" | "DELETED";

type CustomTypeChange = {
	id: string;
	type: "CustomType";
	status: ChangeStatus;
};

type SliceChange = {
	id: string;
	type: "Slice";
	status: ChangeStatus;
	libraryID: string;
};

export type TransactionalMergeArgs = {
	confirmDeleteDocuments: boolean;
	changes: (CustomTypeChange | SliceChange)[];
};

export type TransactionalMergeReturnType = Limit | null;
