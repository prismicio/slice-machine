import type { SimulatorManagerReadSliceSimulatorSetupStep } from "@slicemachine/manager/client";

export type SimulatorStoreType = {
  setupSteps: SimulatorManagerReadSliceSimulatorSetupStep[] | null;
  iframeStatus: "ok" | "ko" | null;
  // setupStatus: SetupStatus;
  setupDrawer: {
    isOpen: boolean;
    openedStep: number;
  };
  isWaitingForIframeCheck: boolean;
};

// export type SetupStatus = {
//   dependencies: "ok" | "ko" | null;
//   manifest: "ok" | "ko" | null;
//   iframe: "ok" | "ko" | null;
// };
