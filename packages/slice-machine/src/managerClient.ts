import { createSliceMachineManagerClient } from "@slicemachine/core2/client";

export const managerClient = createSliceMachineManagerClient({
  serverURL: "/_manager",
});
