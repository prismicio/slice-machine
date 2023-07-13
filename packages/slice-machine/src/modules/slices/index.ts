import {
  ActionType,
  createAction,
  createAsyncAction,
  getType,
} from "typesafe-actions";
import {
  call,
  fork,
  put,
  SagaReturnType,
  select,
  takeLatest,
} from "redux-saga/effects";
import { Reducer } from "redux";

import { LocalOrRemoteSlice } from "@lib/models/common/ModelData";
import { normalizeFrontendSlices } from "@lib/models/common/normalizers/slices";
import { SliceSM } from "@lib/models/common/Slice";
import { LibraryUI } from "@models/common/LibraryUI";
import { withLoader } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { deleteSlice, renameSlice, SaveSliceMockRequest } from "@src/apiClient";
import { modalCloseCreator } from "@src/modules/modal";
import { refreshStateCreator } from "@src/modules/environment";
import { SliceMachineStoreType } from "@src/redux/type";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { updateSliceCreator } from "../selectedSlice/actions";
import {
  generateSliceCustomScreenshotCreator,
  generateSliceScreenshotCreator,
} from "../screenshots/actions";
import { selectSliceById } from "../selectedSlice/selectors";
import { SlicesStoreType } from "./types";

// Action Creators
export const createSlice = createAction("SLICES/CREATE_SLICE")<{
  libraries: Readonly<LibraryUI[]>;
}>();

export const renameSliceCreator = createAsyncAction(
  "SLICES/RENAME.REQUEST",
  "SLICES/RENAME.RESPONSE",
  "SLICES/RENAME.FAILURE"
)<
  {
    libName: string;
    sliceId: string;
    newSliceName: string;
  },
  {
    libName: string;
    renamedSlice: SliceSM;
  }
>();

export const deleteSliceCreator = createAsyncAction(
  "SLICES/DELETE.REQUEST",
  "SLICES/DELETE.RESPONSE",
  "SLICES/DELETE.FAILURE"
)<
  {
    sliceId: string;
    sliceName: string;
    libName: string;
  },
  {
    sliceId: string;
    sliceName: string;
    libName: string;
  }
>();
export const updateSliceMock =
  createAction("SLICE/UPDATE_MOCK")<SaveSliceMockRequest>();

type SlicesActions =
  | ActionType<typeof refreshStateCreator>
  | ActionType<typeof createSlice>
  | ActionType<typeof renameSliceCreator>
  | ActionType<typeof deleteSliceCreator>
  | ActionType<typeof updateSliceCreator>
  | ActionType<typeof generateSliceScreenshotCreator>
  | ActionType<typeof generateSliceCustomScreenshotCreator>
  | ActionType<typeof updateSliceMock>;

// Selectors
export const getLibraries = (
  store: SliceMachineStoreType
): ReadonlyArray<LibraryUI> => store.slices.libraries;

export const getRemoteSlice = (
  store: SliceMachineStoreType,
  componentId: string
): SliceSM | undefined => {
  return store.slices.remoteSlices.find((rs) => rs.id === componentId);
};

export const getRemoteSlices = (
  store: SliceMachineStoreType
): ReadonlyArray<SliceSM> => store.slices.remoteSlices;

export const getFrontendSlices = (
  store: SliceMachineStoreType
): LocalOrRemoteSlice[] =>
  normalizeFrontendSlices(store.slices.libraries, getRemoteSlices(store));

// Reducer
export const slicesReducer: Reducer<SlicesStoreType | null, SlicesActions> = (
  state,
  action
) => {
  if (!state) return null;

  switch (action.type) {
    case getType(refreshStateCreator):
      return {
        ...state,
        libraries: action.payload.libraries,
        remoteSlices: action.payload.remoteSlices,
      };
    case getType(createSlice):
      return {
        ...state,
        libraries: action.payload.libraries,
      };
    case getType(renameSliceCreator.success): {
      const { libName, renamedSlice } = action.payload;
      const newLibs = state.libraries.map((library) => {
        if (library.name !== libName) return library;
        return {
          ...library,
          components: library.components.map((component) => {
            if (component.model.id !== renamedSlice.id) return component;

            return {
              ...component,
              model: renamedSlice,
            };
          }),
        };
      });
      return {
        ...state,
        libraries: newLibs,
      };
    }
    case getType(updateSliceCreator.success): {
      const newComponentUI = action.payload.component;

      const newLibraries = state.libraries.map((library) => {
        if (library.name !== newComponentUI.from) return library;
        return {
          ...library,
          components: library.components.map((component) => {
            return component.model.id !== newComponentUI.model.id
              ? component
              : newComponentUI;
          }),
        };
      });

      return { ...state, libraries: newLibraries };
    }
    case getType(generateSliceScreenshotCreator.success):
    case getType(generateSliceCustomScreenshotCreator.success): {
      const { component, screenshot, variationId } = action.payload;

      const newLibraries = state.libraries.map((library) => {
        if (library.name !== component.from) return library;
        return {
          ...library,
          components: library.components.map((c) =>
            c.model.id === component.model.id
              ? {
                  ...component,
                  screenshots: {
                    ...component.screenshots,
                    [variationId]: screenshot,
                  },
                }
              : c
          ),
        };
      });

      return { ...state, libraries: newLibraries };
    }
    case getType(deleteSliceCreator.success): {
      const { libName, sliceId } = action.payload;
      const newLibs = state.libraries.map((library) => {
        if (library.name !== libName) return library;
        return {
          ...library,
          components: library.components.filter(
            (component) => component.model.id !== sliceId
          ),
        };
      });
      return {
        ...state,
        libraries: newLibs,
      };
    }

    case getType(updateSliceMock): {
      const { libraryID, sliceID, mocks } = action.payload;
      const libraries = state.libraries.map((lib) => {
        if (lib.name !== libraryID) return lib;

        const components = lib.components.map((component) => {
          if (component.model.id !== sliceID) return component;
          return {
            ...component,
            mocks,
          };
        });
        return {
          ...lib,
          components,
        };
      });

      return {
        ...state,
        libraries,
      };
    }

    default:
      return state;
  }
};

// Sagas

export function* renameSliceSaga({
  payload,
}: ReturnType<typeof renameSliceCreator.request>) {
  const { libName, sliceId, newSliceName } = payload;
  try {
    const slice = (yield select((store: SliceMachineStoreType) =>
      selectSliceById(store, libName, sliceId)
    )) as ReturnType<typeof selectSliceById>;
    if (!slice) {
      throw new Error(
        `Slice "${payload.sliceId} in the "${payload.libName}" library not found.`
      );
    }

    const renamedSlice = renameSliceModel({
      slice: slice.model,
      newName: newSliceName,
    });

    yield call(renameSlice, renamedSlice, libName);
    yield put(renameSliceCreator.success({ libName, renamedSlice }));

    yield put(modalCloseCreator());
    yield put(
      openToasterCreator({
        content: "Slice name updated",
        type: ToasterType.SUCCESS,
      })
    );
  } catch (e) {
    yield put(
      openToasterCreator({
        content: "Internal Error: Slice name not saved",
        type: ToasterType.ERROR,
      })
    );
  }
}

function* watchRenameSlice() {
  yield takeLatest(
    getType(renameSliceCreator.request),
    withLoader(renameSliceSaga, LoadingKeysEnum.RENAME_SLICE)
  );
}

export function* deleteSliceSaga({
  payload,
}: ReturnType<typeof deleteSliceCreator.request>) {
  const { libName, sliceId, sliceName } = payload;
  try {
    const result = (yield call(
      deleteSlice,
      sliceId,
      libName
    )) as SagaReturnType<typeof deleteSlice>;
    if (result.errors.length > 0) {
      throw result.errors;
    }
    yield put(deleteSliceCreator.success(payload));
    yield put(
      openToasterCreator({
        content: `Successfully deleted Slice “${sliceName}”`,
        type: ToasterType.SUCCESS,
      })
    );
  } catch (e) {
    yield put(
      openToasterCreator({
        content: "An unexpected error happened while deleting your slice.",
        type: ToasterType.ERROR,
      })
    );
  }
  yield put(modalCloseCreator());
}

function* watchDeleteSlice() {
  yield takeLatest(
    getType(deleteSliceCreator.request),
    withLoader(deleteSliceSaga, LoadingKeysEnum.DELETE_SLICE)
  );
}

// Saga Exports
export function* watchSliceSagas() {
  yield fork(watchRenameSlice);
  yield fork(watchDeleteSlice);
}

type RenameSliceModelArgs = {
  slice: SliceSM;
  newName: string;
};

export function renameSliceModel(args: RenameSliceModelArgs): SliceSM {
  return {
    ...args.slice,
    name: args.newName,
  };
}
