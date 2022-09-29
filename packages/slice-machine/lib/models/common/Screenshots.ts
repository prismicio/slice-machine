import { ScreenshotUI } from "./ComponentUI";

export interface ScreenshotRequest {
  libraryName: string;
  sliceName: string;
  variationId: string;
}

export interface ScreenshotResponse {
  err: Error | null;
  reason: string | null;
  warning?: string | null;
  screenshots: ScreenshotUI[];
}

export type TmpFile = File & { path: string };
export interface CustomScreenshotRequest {
  libraryName: string;
  sliceName: string;
  variationId: string;
}
