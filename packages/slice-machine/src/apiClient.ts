import { SimulatorCheckResponse } from "@models/common/Simulator";
import { SliceMachineManagerClient } from "@slicemachine/manager/client";
import { SliceSM, Slices } from "@lib/models/common/Slice";
import { CustomTypes, CustomTypeSM } from "@lib/models/common/CustomType";

import { CheckAuthStatusResponse } from "@models/common/Auth";
import ServerState from "@models/server/ServerState";
import {
  CustomScreenshotRequest,
  ScreenshotRequest,
} from "@lib/models/common/Screenshots";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { buildEmptySliceModel } from "@lib/utils/slices/buildEmptySliceModel";
import { ComponentMocks } from "@lib/models/common/Library";
import { PackageChangelog } from "@lib/models/common/versions";

import { managerClient } from "./managerClient";
import { Frameworks } from "@lib/models/common/Framework";

/** State Routes * */

export const getState = async (): Promise<ServerState> => {
  const rawState = await managerClient.getState();

  // `rawState` from the client contains non-SM-specific models. We need to
  // transform the data to something SM recognizes.
  const state: ServerState = {
    ...rawState,
    // @ts-expect-error TS(2322) FIXME: Type '{ framework: Frameworks; mockConfig: CustomT... Remove this comment to see the full error message
    env: {
      ...rawState.env,
      framework: rawState.env.framework as Frameworks,
    },
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

/** Custom Type Routes * */

export const saveCustomType = async (
  customType: CustomTypeSM
): ReturnType<SliceMachineManagerClient["customTypes"]["updateCustomType"]> => {
  return await managerClient.customTypes.updateCustomType({
    model: CustomTypes.fromSM(customType),
  });
};

export const renameCustomType = (
  customType: CustomTypeSM
): ReturnType<SliceMachineManagerClient["customTypes"]["renameCustomType"]> => {
  return managerClient.customTypes.renameCustomType({
    model: CustomTypes.fromSM(customType),
  });
};

// export const deleteCustomType = (
//   customTypeId: string
// ): Promise<AxiosResponse> => {
//   return axios.delete(
//     `/api/custom-types/delete?id=${customTypeId}`,
//     defaultAxiosConfig
//   );
// };

/** Slice Routes * */
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

// export const deleteSlice = (
//   sliceId: string,
//   libName: string
// ): Promise<AxiosResponse> => {
//   const requestBody = {
//     sliceId,
//     libName,
//   };
//   return axios.delete(`/api/slices/delete`, {
//     ...defaultAxiosConfig,
//     data: requestBody,
//   });
// };

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
      sliceMachineUIOrigin: window.location.origin,
      libraryID: params.libraryName,
      sliceID: params.sliceId,
      variationID: params.variationId,
      viewport: {
        width: params.screenDimensions.width,
        height: params.screenDimensions.height,
      },
    });

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
};

export const generateSliceCustomScreenshotApiClient = async (
  params: CustomScreenshotRequest
): Promise<{
  url: string;
  errors: Awaited<
    ReturnType<SliceMachineManagerClient["slices"]["updateSliceScreenshot"]>
  >["errors"];
}> => {
  const { errors } = await managerClient.slices.updateSliceScreenshot({
    libraryID: params.libraryName,
    sliceID: params.sliceId,
    variationID: params.variationId,
    data: params.file,
  });

  return {
    url: URL.createObjectURL(params.file),
    errors,
  };
};

export const saveSliceApiClient = async (
  component: ComponentUI
): Promise<
  Awaited<ReturnType<(typeof managerClient)["slices"]["updateSlice"]>>
> => {
  return await managerClient.slices.updateSlice({
    libraryID: component.from,
    model: Slices.fromSM(component.model),
  });
};

export const pushChanges: SliceMachineManagerClient["prismicRepository"]["pushChanges"] =
  async (payload) => {
    return await managerClient.prismicRepository.pushChanges(payload);
  };

/** Auth Routes * */

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

/** Simulator Routes * */

export const checkSimulatorSetup =
  async (): Promise<SimulatorCheckResponse> => {
    const localSliceSimulatorURL =
      await managerClient.simulator.getLocalSliceSimulatorURL();

    return {
      manifest: Boolean(localSliceSimulatorURL) ? "ok" : "ko",
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

export const telemetry = {
  group: managerClient.telemetry.group,
  track: managerClient.telemetry.track,
};
