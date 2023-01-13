import { ScreenshotUI } from "./ComponentUI";

export interface ScreenDimensions {
  width: number;
  height: number;
}
export interface ScreenshotRequest {
  libraryName: string;
  sliceName: string;
  variationId: string;
  screenDimensions: ScreenDimensions;
  href: string;
}

type ScreenshotErrorResponse = {
  err: Error;
  reason: string;
};

type ScreenshotSuccessResponse = {
  screenshot: ScreenshotUI;
};

export type ScreenshotResponse =
  | ScreenshotErrorResponse
  | ScreenshotSuccessResponse;

export const isError = (
  response: ScreenshotResponse
): response is ScreenshotErrorResponse => "err" in response;

export type TmpFile = File & { path: string };
export interface CustomScreenshotRequest {
  libraryName: string;
  sliceName: string;
  variationId: string;
}
