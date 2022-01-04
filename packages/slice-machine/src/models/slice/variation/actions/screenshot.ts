import { ScreenshotUI } from "lib/models/common/ComponentUI";
import { fetchApi } from "../../../../../lib/builders/common/fetch";
import { ActionType } from "./ActionType";
import { ScreenshotResponse } from "@models/common/Screenshots";

export function generateScreenShot(
  dispatch: ({
    type,
    payload,
  }: {
    type: string;
    payload?: { screenshots: Record<string, ScreenshotUI> };
  }) => void
) {
  return (): ((
    libraryName: string,
    sliceName: string,
    setData: (data: object) => void
  ) => void) => {
    return (
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
  dispatch: ({
    type,
    payload,
  }: {
    type: string;
    payload?: { variationId: string; screenshot: ScreenshotUI };
  }) => void
) {
  return (variationId: string) => {
    return (
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
