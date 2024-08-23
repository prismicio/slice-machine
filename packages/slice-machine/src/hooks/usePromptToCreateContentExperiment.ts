import { useExperimentVariant } from "@/hooks/useExperimentVariant";

type UsePromptToCreateContentExperimentReturnType = { eligible: boolean };

export function usePromptToCreateContentExperiment(): UsePromptToCreateContentExperimentReturnType {
  const variant = useExperimentVariant("slicemachine-prompt-to-create-content");

  // we serve the previous version only to users in the "control" group
  // users in:
  // - variant "on"
  // - out of experiment scope,
  // - with telemetry deactivated
  // will see the new version
  return {
    eligible: variant?.value !== "control",
  };
}
