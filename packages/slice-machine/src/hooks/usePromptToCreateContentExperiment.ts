import { useExperimentVariant } from "@/hooks/useExperimentVariant";

type UsePromptToCreateContentExperimentReturnType = { eligible: boolean };

export function usePromptToCreateContentExperiment(): UsePromptToCreateContentExperimentReturnType {
  const variant = useExperimentVariant("slicemachine-prompt-to-create-content");

  // serve the experimental version to user with Telemetry deactivated
  return { eligible: variant === undefined || variant?.value === "on" };
}
