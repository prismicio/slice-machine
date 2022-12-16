import { createSliceMachineManagerClient } from "@slicemachine/manager/client";

export const managerClient = createSliceMachineManagerClient({
  serverURL: "/_manager",
});
