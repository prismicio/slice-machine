import { SimulatorManagerReadSliceSimulatorSetupStep } from "@slicemachine/manager/client";

export type SimulatorStoreType = {
  setupSteps: SimulatorManagerReadSliceSimulatorSetupStep[] | null;
  // we use strings to check if key is defined
  iframeStatus: "ok" | "ko" | null;
  setupStatus: {
    manifest: "ok" | "ko" | null;
  };
  isWaitingForIframeCheck: boolean;
  savingMock: boolean;
};
