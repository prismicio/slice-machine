import type { CustomTypeSM } from "@lib/models/common/CustomType";
import type { SliceSM } from "@lib/models/common/Slice";
import type { Screenshot } from "@lib/models/common/Library";

// Generics

type LocalOrRemote<L = unknown, R = L> =
  | LocalAndRemote<L, R>
  | LocalOnly<L>
  | RemoteOnly<R>;
type LocalAndRemote<L = unknown, R = L> = LocalOnly<L> & RemoteOnly<R>;
type LocalOnly<L = unknown> = { local: L };
type RemoteOnly<R = unknown> = { remote: R };

export function hasLocalAndRemote<T extends LocalOrRemote>(
  obj: T
): obj is T extends LocalAndRemote ? T : never {
  return "local" in obj && "remote" in obj;
}

export function hasLocal<T extends LocalOrRemote>(
  obj: T
): obj is T extends LocalAndRemote | LocalOnly ? T : never {
  return "local" in obj;
}

export function hasRemote<T extends LocalOrRemote>(
  obj: T
): obj is T extends LocalAndRemote | RemoteOnly ? T : never {
  return "remote" in obj;
}

export function isRemoteOnly<T extends LocalOrRemote>(
  obj: T
): obj is T extends RemoteOnly ? T : never {
  return hasRemote(obj) && !hasLocal(obj);
}

export function isLocalOnly<T extends LocalOrRemote>(
  obj: T
): obj is T extends LocalOnly ? T : never {
  return !hasRemote(obj) && hasLocal(obj);
}

// Custom Types

export type LocalOrRemoteCustomType = LocalOrRemote<CustomTypeSM>;
export type LocalAndRemoteCustomType = LocalAndRemote<CustomTypeSM>;
export type LocalOnlyCustomType = LocalOnly<CustomTypeSM>;
export type RemoteOnlyCustomType = RemoteOnly<CustomTypeSM>;

// Slices

export type LocalOrRemoteSlice =
  | LocalAndRemoteSlice
  | LocalOnlySlice
  | RemoteOnlySlice;
export type LocalAndRemoteSlice = LocalAndRemote<SliceSM> & {
  localScreenshots: Partial<Record<string, Screenshot>>;
};
export type LocalOnlySlice = LocalOnly<SliceSM> & {
  localScreenshots: Partial<Record<string, Screenshot>>;
};
export type RemoteOnlySlice = RemoteOnly<SliceSM> & {
  localScreenshots: Partial<Record<string, Screenshot>>;
};

// Models

export type LocalOrRemoteModel = LocalOrRemoteCustomType | LocalOrRemoteSlice;

export function getModelId<M extends CustomTypeSM | SliceSM>(
  model: LocalOrRemote<M>
): M["id"] {
  return hasLocal(model) ? model.local.id : model.remote.id;
}
