import { ScreenshotUI } from "lib/models/common/ComponentUI";
import type Models from "@slicemachine/core/build/src/models";
import { fetchApi } from "../../../../../lib/builders/common/fetch";
import { ActionType } from "./ActionType";

type GenerateScreenShotResponse = {
  screenshots: Record<string, Models.Screenshot>;
};

export function generateScreenShot(
  dispatch: ({ type, payload }: { type: string; payload?: any }) => void
) {
  return (_variationId: string) => {
    return async (
      libraryName: string,
      sliceName: string,
      setData: (data: object) => void
    ) => {
      fetchApi({
        url: `/api/screenshot?sliceName=${sliceName}&libraryName=${libraryName}`,
        setData,
        data: {
          onLoad: { imageLoading: true },
          onResponse: { imageLoading: false },
        },
        successMessage: "Screenshots were saved to FileSystem",
        onSuccess({ screenshots }: GenerateScreenShotResponse) {
          dispatch({
            type: ActionType.GenerateScreenShot,
            payload: { screenshots },
          });
        },
      });
    };
  };
}

export function generateCustomScreenShot(
  dispatch: ({ type, payload }: { type: string; payload?: any }) => void
) {
  return (variationId: string) => {
    return async (
      libraryName: string,
      sliceName: string,
      setData: (data: object) => void,
      file: Blob
    ) => {
      const form = new FormData();
      form.append("file", file);
      form.append("libraryName", libraryName);
      form.append("sliceName", sliceName);
      form.append("variationId", variationId);

      fetchApi({
        url: "/api/custom-screenshot",
        setData,
        params: {
          method: "POST",
          body: form,
          headers: {},
        },
        data: {
          onLoad: { imageLoading: true },
          onResponse: { imageLoading: false },
        },
        successMessage: "New screenshot added!",
        onSuccess(screenshot: ScreenshotUI) {
          dispatch({
            type: ActionType.GenerateCustomScreenShot,
            payload: { variationId, screenshot },
          });
        },
      });
    };
  };
}
