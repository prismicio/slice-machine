import { useExperimentVariant } from "@/hooks/useExperimentVariant";

type UsePromptToCreateContentExperimentReturnType = { eligible: boolean };

export function usePromptToCreateContentExperiment(): UsePromptToCreateContentExperimentReturnType {
  const variant = useExperimentVariant("slicemachine-prompt-to-create-content");

  return {
    eligible:
      // serve the experimental version to user with Telemetry deactivated
      variant === undefined ||
      // serve the experimental version to user out of experiment scope
      variant?.value === "off" ||
      // serve the experimental version in the experiment test group with variant "on"
      variant?.value === "on",
  };
}
