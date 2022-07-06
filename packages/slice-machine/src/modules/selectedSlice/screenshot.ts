import { fetchApi } from "@lib/builders/common/fetch";
import { ScreenshotUI } from "@lib/models/common/ComponentUI";
import { ScreenshotResponse, Screenshots } from "@models/common/Screenshots";

export async function generateScreenShot(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _variationId: string,
  libraryName: string,
  sliceName: string,
  setData: (data: any) => void,
  callback: (screenshots: Screenshots) => void
) {
  await fetchApi({
    url: `/api/screenshot?sliceName=${sliceName}&libraryName=${libraryName}`,
    setData,
    data: {
      onLoad: { imageLoading: true },
      onResponse: { imageLoading: false },
    },
    successMessage: "Screenshots were saved to FileSystem",
    onSuccess({ screenshots }: ScreenshotResponse) {
      callback(screenshots);
    },
  });
}

export async function generateCustomScreenShot(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variationId: string,
  libraryName: string,
  sliceName: string,
  setData: (data: any) => void,
  file: Blob,
  callback: (variationId: string, screenshots: ScreenshotUI) => void
) {
  const form = new FormData();
  form.append("file", file);
  form.append("libraryName", libraryName);
  form.append("sliceName", sliceName);
  form.append("variationId", variationId);

  await fetchApi({
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
      callback(variationId, screenshot);
    },
  });
}
