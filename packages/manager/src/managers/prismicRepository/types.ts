import {
	CustomType,
	SharedSlice,
} from "@prismicio/types-internal/lib/customtypes";
import * as t from "io-ts";

export const PrismicRepositoryUserAgent = {
	SliceMachine: "prismic-cli/sm",
	LegacyZero: "prismic-cli/0",
} as const;
export type PrismicRepositoryUserAgents =
	(typeof PrismicRepositoryUserAgent)[keyof typeof PrismicRepositoryUserAgent];

export const PrismicRepositoryRole = {
	SuperUser: "SuperUser",
	Administrator: "Administrator",
	Owner: "Owner",
	Manager: "Manager",
	Publisher: "Publisher",
	Writer: "Writer",
	Readonly: "Readonly",
} as const;
export type PrismicRepositoryRoles =
	(typeof PrismicRepositoryRole)[keyof typeof PrismicRepositoryRole];

export const PrismicRepository = t.type({
	domain: t.string,
	name: t.string,
	role: t.union([
		t.keyof(PrismicRepositoryRole),
		t.record(t.string, t.keyof(PrismicRepositoryRole)),
	]),
});
export type PrismicRepository = t.TypeOf<typeof PrismicRepository>;

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
	payload: SharedSlice;
}
export interface SliceUpdateChange extends Change {
	type: ChangeTypes.SLICE_UPDATE;
	payload: SharedSlice;
}
export interface SliceDeleteChange extends DeleteChange {
	type: ChangeTypes.SLICE_DELETE;
}
export interface CustomTypeInsertChange extends Change {
	type: ChangeTypes.CUSTOM_TYPE_INSERT;
	payload: CustomType;
}
export interface CustomTypeUpdateChange extends Change {
	type: ChangeTypes.CUSTOM_TYPE_UPDATE;
	payload: CustomType;
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

/**
 * Framework id sent to Segment from wroom. Property used for the "framework"
 * and "hasSlicemachine" properties.
 *
 * Values from:
 * https://github.com/prismicio/wroom/blob/65d4f53fd46df7d366d80e7ba9c965339ac7369d/subprojects/common/app/models/Framework.scala#LL20C6-L20C6
 */
export type FrameworkWroomTelemetryID = "next" | "nuxt" | "sveltekit" | "other";

/**
 * Starter id sent to Segment from wroom.Property used for the "starter"
 * properties.
 *
 * Values from:
 * https://github.com/prismicio/wroom/blob/65d4f53fd46df7d366d80e7ba9c965339ac7369d/conf/application.conf#L938
 */
export type StarterId =
	| "next_multi_page"
	| "next_blog"
	| "next_multi_lang"
	| "nuxt_multi_page"
	| "nuxt_blog"
	| "nuxt_multi_lang";
