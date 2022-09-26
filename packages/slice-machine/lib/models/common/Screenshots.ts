import { ScreenshotUI } from "./ComponentUI";
import { VariationSM } from "@slicemachine/core/build/models";

export type Screenshots = Record<VariationSM["id"], ScreenshotUI>;

export interface ScreenshotRequest {
  libraryName: string;
  sliceName: string;
  variationId: string;
  screenWidth: string;
}

export interface ScreenshotResponse {
  err: Error | null;
  reason: string | null;
  warning?: string | null;
  screenshots: Screenshots;
}

export type TmpFile = File & { path: string };
export interface CustomScreenshotRequest {
  libraryName: string;
  sliceName: string;
  variationId: string;
}
