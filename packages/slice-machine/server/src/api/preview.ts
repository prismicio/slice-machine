import handleManifest, { ManifestInfo, ManifestState } from "@lib/env/manifest";

enum PreviewCheckError {
  MANIFEST_NOT_CONFIGURED = "Error manifest not configured",
}

type PreviewCheckResponse = {
  err?: PreviewCheckError;
};

export default async function handler(): Promise<PreviewCheckResponse> {
  const cwd = process.env.CWD || process.cwd();
  if (!cwd) {
    const message =
      "[api/env]: Unrecoverable error. Could not find cwd. Exiting..";
    console.error(message);
    throw new Error(message);
  }

  const manifestInfo: ManifestInfo = handleManifest(cwd);
  if (manifestInfo.state !== ManifestState.Valid || !manifestInfo.content) {
    console.error(manifestInfo.message);
    throw new Error(manifestInfo.message);
  }

  if (!manifestInfo.content.localSliceCanvasURL) {
    return {
      err: PreviewCheckError.MANIFEST_NOT_CONFIGURED,
    };
  }

  return {};
}
