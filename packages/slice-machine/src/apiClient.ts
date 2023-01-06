import { SimulatorCheckResponse } from "@models/common/Simulator";
import { SliceMachineManagerClient } from "@slicemachine/manager/client";
import { Slices, SliceSM } from "@slicemachine/core/build/models";
import {
  CustomTypes,
  CustomTypeSM,
} from "@slicemachine/core/build/models/CustomType";

import { CheckAuthStatusResponse } from "@models/common/Auth";
import ServerState from "@models/server/ServerState";
import {
  CustomScreenshotRequest,
  ScreenshotRequest,
} from "@lib/models/common/Screenshots";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { buildEmptySliceModel } from "@lib/utils/slices/buildEmptySliceModel";
import { ComponentMocks } from "@slicemachine/core/build/models";
import { PackageChangelog } from "@lib/models/common/versions";

import { managerClient } from "./managerClient";

/** State Routes **/

export const getState = async (): Promise<ServerState> => {
  const rawState = await managerClient.getState();

  // `rawState` from the client contains non-SM-specific models. We need to
  // transform the data to something SM recognizes.
  const state: ServerState = {
    ...rawState,
    libraries: rawState.libraries.map((library) => {
      return {
        ...library,
        components: library.components.map((component) => {
          return {
            ...component,
            model: Slices.toSM(component.model),

            // Replace screnshot Blobs with URLs.
            screenshots: Object.fromEntries(
              Object.entries(component.screenshots).map(
                ([variationID, screenshot]) => {
                  return [
                    variationID,
                    {
                      ...screenshot,
                      url: URL.createObjectURL(screenshot.data),
                    },
                  ];
                }
              )
            ),
          };
        }),
      };
    }),
    customTypes: rawState.customTypes.map((customTypeModel) => {
      return CustomTypes.toSM(customTypeModel);
    }),
    remoteCustomTypes: rawState.remoteCustomTypes.map(
      (remoteCustomTypeModel) => {
        return CustomTypes.toSM(remoteCustomTypeModel);
      }
    ),
    remoteSlices: rawState.remoteSlices.map((remoteSliceModel) => {
      return Slices.toSM(remoteSliceModel);
    }),
  };

  return state;
};

/** Custom Type Routes **/

export const saveCustomType = async (
  customType: CustomTypeSM
): ReturnType<SliceMachineManagerClient["customTypes"]["updateCustomType"]> => {
  return await managerClient.customTypes.updateCustomType({
    model: CustomTypes.fromSM(customType),
  });

  // const requestBody: SaveCustomTypeBody = {
  //   model: customType,
  //   mockConfig: mockConfig,
  // };
  //
  // return axios.post("/api/custom-types/save", requestBody, defaultAxiosConfig);
};

export const renameCustomType = (
  customType: CustomTypeSM
): ReturnType<SliceMachineManagerClient["customTypes"]["renameCustomType"]> => {
  return managerClient.customTypes.renameCustomType({
    model: CustomTypes.fromSM(customType),
  });
};

export const pushCustomType = async (customTypeId: string): Promise<void> => {
  await managerClient.customTypes.pushCustomType({
    id: customTypeId,
  });
};

/** Slice Routes **/
export const createSlice = async (
  sliceName: string,
  libName: string
): Promise<{
  variationId: string;
  errors: Awaited<
    ReturnType<SliceMachineManagerClient["slices"]["createSlice"]>
  >["errors"];
}> => {
  const model = buildEmptySliceModel({ sliceName });

  const { errors } = await managerClient.slices.createSlice({
    libraryID: libName,
    model,
  });

  return {
    variationId: model.variations[0].id,
    errors,
  };
};

export const renameSlice = async (
  slice: SliceSM,
  libName: string
): ReturnType<SliceMachineManagerClient["slices"]["renameSlice"]> => {
  return await managerClient.slices.renameSlice({
    libraryID: libName,
    model: Slices.fromSM(slice),
  });
};

export const generateSliceScreenshotApiClient = async (
  params: ScreenshotRequest
): Promise<
  | {
      url: string;
      errors: Awaited<
        ReturnType<SliceMachineManagerClient["slices"]["updateSliceScreenshot"]>
      >["errors"];
    }
  | undefined
> => {
  const screenshot =
    await managerClient.screenshots.captureSliceSimulatorScreenshot({
      libraryID: params.libraryName,
      sliceID: params.sliceId,
      variationID: params.variationId,
      viewport: {
        width: params.screenDimensions.width,
        height: params.screenDimensions.height,
      },
    });

  if (screenshot.data) {
    const { errors } = await managerClient.slices.updateSliceScreenshot({
      libraryID: params.libraryName,
      sliceID: params.sliceId,
      variationID: params.variationId,
      data: screenshot.data,
    });

    return {
      url: URL.createObjectURL(screenshot.data),
      errors,
    };
  }

  // return axios.post("/api/screenshot", params, defaultAxiosConfig);
};

export const generateSliceCustomScreenshotApiClient = (
  params: CustomScreenshotRequest
): ReturnType<SliceMachineManagerClient["slices"]["updateSliceScreenshot"]> => {
  return managerClient.slices.updateSliceScreenshot({
    libraryID: params.libraryName,
    sliceID: params.sliceId,
    variationID: params.variationId,
    data: params.file,
  });
};

export const saveSliceApiClient = async (
  component: ComponentUI
): Promise<
  Awaited<ReturnType<typeof managerClient["slices"]["updateSlice"]>>
> => {
  return await managerClient.slices.updateSlice({
    libraryID: component.from,
    model: Slices.fromSM(component.model),
  });
};

export const pushSliceApiClient = async (
  component: ComponentUI
): ReturnType<SliceMachineManagerClient["slices"]["pushSlice"]> => {
  return await managerClient.slices.pushSlice({
    libraryID: component.from,
    sliceID: component.model.id,
  });
};

/** Auth Routes **/

export const startAuth = async (): Promise<void> => {
  return await managerClient.user.logout();
};

export const checkAuthStatus = async (): Promise<CheckAuthStatusResponse> => {
  const isLoggedIn = await managerClient.user.checkIsLoggedIn();

  if (isLoggedIn) {
    const profile = await managerClient.user.getProfile();

    return {
      status: "ok",
      shortId: profile.shortId,
      intercomHash: profile.intercomHash,
    };
  } else {
    return {
      status: "pending",
    };
  }
};

/** Simulator Routes **/

export const checkSimulatorSetup =
  async (): Promise<SimulatorCheckResponse> => {
    const localSliceSimulatorURL =
      await managerClient.simulator.getLocalSliceSimulatorURL();

    return {
      manifest: localSliceSimulatorURL ? "ok" : "ko",
      value: localSliceSimulatorURL,
    };
  };

export const getSimulatorSetupSteps = async (): ReturnType<
  typeof managerClient.simulator.readSliceSimulatorSetupSteps
> => {
  return await managerClient.simulator.readSliceSimulatorSetupSteps();
};

export type SaveSliceMockRequest = {
  sliceName: string;
  libraryName: string;
  mock: ComponentMocks;
};

export const saveSliceMock = async (
  payload: SaveSliceMockRequest
): ReturnType<SliceMachineManagerClient["slices"]["updateSliceMocks"]> => {
  return await managerClient.slices.updateSliceMocks({
    libraryID: payload.libraryName,
    sliceID: payload.sliceName,
    mocks: payload.mock,
  });
};

export const getChangelogApiClient = async (): Promise<PackageChangelog> => {
  const [
    currentVersion,
    latestNonBreakingVersion,
    updateAvailable,
    versionsWithKind,
  ] = await Promise.all([
    managerClient.versions.getRunningSliceMachineVersion(),
    managerClient.versions.getLatestNonBreakingSliceMachineVersion(),
    managerClient.versions.checkIsUpdateAvailable(),
    managerClient.versions.getAllStableSliceMachineVersionsWithKind(),
  ]);

  const versionsWithMetadata = await Promise.all(
    versionsWithKind.map(async (versionWithKind) => {
      const releaseNotes =
        await managerClient.versions.getSliceMachineReleaseNotesForVersion({
          version: versionWithKind.version,
        });

      return {
        versionNumber: versionWithKind.version,
        releaseNote: releaseNotes ?? null,
        kind: versionWithKind.kind,
      };
    })
  );

  return {
    currentVersion,
    updateAvailable,
    latestNonBreakingVersion: latestNonBreakingVersion ?? null,
    versions: versionsWithMetadata,
  };
};
