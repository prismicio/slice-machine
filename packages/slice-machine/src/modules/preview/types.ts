export type SimulatorStoreType = {
  setupStatus: SetupStatus;
  setupDrawer: {
    isOpen: boolean;
    openedStep: number;
  };
  isWaitingForIframeCheck: boolean;
};

export type SetupStatus = {
  dependencies: "ok" | "ko" | null;
  manifest: "ok" | "ko" | null;
  iframe: "ok" | "ko" | null;
};
