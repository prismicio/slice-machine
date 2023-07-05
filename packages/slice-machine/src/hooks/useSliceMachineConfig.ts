import type { SliceMachineConfig } from "@slicemachine/manager/*";
import { getSliceMachineConfig } from "@src/apiClient";
import { useState, useEffect } from "react";

export const useSliceMachineConfig = () => {
  const [config, setConfig] = useState<SliceMachineConfig | null>(null);
  useEffect(() => {
    getSliceMachineConfig()
      .then(setConfig)
      .catch(() => setConfig(null));
  }, []);

  return config;
};
