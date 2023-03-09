// TODO: all of this should probably be shared somewhere
import { CustomTypes } from "@prismicio/types-internal";
import * as t from "io-ts";

type LibraryMeta = {
	reader: {
		name: string;
		version: string;
	};
	build(libPath: string):
		| {
				name: string;
				version: string;
		  }
		| undefined;
};
export interface ComponentInfo {
	fileName: string | null;
	extension: string | null;
	model: CustomTypes.Widgets.Slices.SharedSlice;
	screenshots: {
		[variationId: string]: Screenshot;
	};
	mock?: any;
}
export declare const ComponentInfo: {
	hasPreviewsMissing(info: ComponentInfo): boolean;
};
export interface Component extends ComponentInfo {
	from: string;
	href: string;
	pathToSlice: string;
}
export interface Screenshot {
	path: string;
	hash: string;
}
export interface Library<C extends Component> {
	name: string;
	path: string;
	isLocal: boolean;
	components: ReadonlyArray<C>;
	meta?: LibraryMeta;
}

// Generics

type LocalOrRemote<L = unknown, R = L> =
	| LocalAndRemote<L, R>
	| LocalOnly<L>
	| RemoteOnly<R>;
type LocalAndRemote<L = unknown, R = L> = LocalOnly<L> & RemoteOnly<R>;
type LocalOnly<L = unknown> = { local: L };
type RemoteOnly<R = unknown> = { remote: R };

export function hasLocalAndRemote<T extends LocalOrRemote>(
	obj: T,
): obj is T extends LocalAndRemote ? T : never {
	return "local" in obj && "remote" in obj;
}

export function hasLocal<T extends LocalOrRemote>(
	obj: T,
): obj is T extends LocalAndRemote | LocalOnly ? T : never {
	return "local" in obj;
}

export function hasRemote<T extends LocalOrRemote>(
	obj: T,
): obj is T extends LocalAndRemote | RemoteOnly ? T : never {
	return "remote" in obj;
}

export function isRemoteOnly<T extends LocalOrRemote>(
	obj: T,
): obj is T extends RemoteOnly ? T : never {
	return hasRemote(obj) && !hasLocal(obj);
}

export function isLocalOnly<T extends LocalOrRemote>(
	obj: T,
): obj is T extends LocalOnly ? T : never {
	return !hasRemote(obj) && hasLocal(obj);
}

// Custom Types

export type LocalOrRemoteCustomType = LocalOrRemote<CustomTypes.CustomType>;
export type LocalAndRemoteCustomType = LocalAndRemote<CustomTypes.CustomType>;
export type LocalOnlyCustomType = LocalOnly<CustomTypes.CustomType>;
export type RemoteOnlyCustomType = RemoteOnly<CustomTypes.CustomType>;

// Slices

export type LocalOrRemoteSlice =
	| LocalAndRemoteSlice
	| LocalOnlySlice
	| RemoteOnlySlice;
export type LocalAndRemoteSlice =
	LocalAndRemote<CustomTypes.Widgets.Slices.SharedSlice> & {
		localScreenshots: Partial<Record<string, Screenshot>>;
	};
export type LocalOnlySlice =
	LocalOnly<CustomTypes.Widgets.Slices.SharedSlice> & {
		localScreenshots: Partial<Record<string, Screenshot>>;
	};
export type RemoteOnlySlice =
	RemoteOnly<CustomTypes.Widgets.Slices.SharedSlice> & {
		localScreenshots: Partial<Record<string, Screenshot>>;
	};

// Models

export type LocalOrRemoteModel = LocalOrRemoteCustomType | LocalOrRemoteSlice;

export function getModelId<
	M extends CustomTypes.CustomType | CustomTypes.Widgets.Slices.SharedSlice,
>(model: LocalOrRemote<M>): M["id"] {
	return hasLocal(model) ? model.local.id : model.remote.id;
}

export enum ModelStatus {
	New = "NEW", // new model that does not exist in the repo
	Modified = "MODIFIED", // model that exist both remote and locally but has modifications locally
	Synced = "SYNCED", // model that exist both remote and locally with no modifications
	Deleted = "DELETED", // model that exist remotely but not locally
	Unknown = "UNKNOWN", // unable to detect the status of a model
}

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
