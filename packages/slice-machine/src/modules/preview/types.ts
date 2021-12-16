export type PreviewStoreType = {
  setupStatus: SetupStatus;
  setupDrawer: {
    isOpen: boolean;
    openedStep: number;
  };
};

export type SetupStatus = {
  dependencies: "ok" | "ko" | null;
  manifest: "ok" | "ko" | null;
  iframe: "ok" | "ko" | null;
};
