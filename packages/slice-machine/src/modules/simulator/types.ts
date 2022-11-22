export type SimulatorStoreType = {
  // we use strings to check if key is defined
  iframeStatus: "ok" | "ko" | null;
  setupStatus: {
    manifest: "ok" | "ko" | null;
  };
  isWaitingForIframeCheck: boolean;
};
