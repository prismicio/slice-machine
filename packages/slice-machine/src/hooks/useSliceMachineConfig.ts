import type { SliceMachineConfig } from "@slicemachine/manager";
import { managerClient } from "../managerClient";
import { useState, useEffect } from "react";

export const useSliceMachineConfig = () => {
  const [config, setConfig] = useState<SliceMachineConfig | null>(null);
  useEffect(() => {
    managerClient.project
      .getSliceMachineConfig()
      .then(setConfig)
      .catch(() => setConfig(null));
  }, []);

  return config;
};
