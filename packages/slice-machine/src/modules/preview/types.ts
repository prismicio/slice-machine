export type PreviewStoreType = {
  setupStatus: {
    dependencies: "ok" | "ko" | null;
    manifest: "ok" | "ko" | null;
    iframe: "ok" | "ko" | null;
  };
  setupDrawer: {
    isOpen: boolean;
    openedStep: number;
  };
};
