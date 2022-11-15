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

export interface ScreenshotResponse {
  err: Error | null;
  reason: string | null;
  warning?: string | null;
  screenshot: ScreenshotUI | null;
}

export type TmpFile = File & { path: string };
export interface CustomScreenshotRequest {
  libraryName: string;
  sliceName: string;
  variationId: string;
}
