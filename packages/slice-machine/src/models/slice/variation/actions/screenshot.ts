import { ScreenshotUI } from "lib/models/common/ComponentUI";
import { fetchApi } from "../../../../../lib/builders/common/fetch";
import { ActionType } from "./ActionType";
import { ScreenshotResponse } from "@models/common/Screenshots";

export function generateScreenShot(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: ({ type, payload }: { type: string; payload?: any }) => void
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (_variationId: string) => {
    return async (
      libraryName: string,
      sliceName: string,
      setData: (data: object) => void
      // eslint-disable-next-line @typescript-eslint/require-await
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchApi({
        url: `/api/screenshot?sliceName=${sliceName}&libraryName=${libraryName}`,
        setData,
        data: {
          onLoad: { imageLoading: true },
          onResponse: { imageLoading: false },
        },
        successMessage: "Screenshots were saved to FileSystem",
        onSuccess({ screenshots }: ScreenshotResponse) {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: ({ type, payload }: { type: string; payload?: any }) => void
) {
  return (variationId: string) => {
    return async (
      libraryName: string,
      sliceName: string,
      setData: (data: object) => void,
      file: Blob
      // eslint-disable-next-line @typescript-eslint/require-await
    ) => {
      const form = new FormData();
      form.append("file", file);
      form.append("libraryName", libraryName);
      form.append("sliceName", sliceName);
      form.append("variationId", variationId);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
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
