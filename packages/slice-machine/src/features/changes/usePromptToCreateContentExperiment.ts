import { useExperimentVariant } from "@/hooks/useExperimentVariant";

type UsePromptToCreateContentExperimentReturnType = { eligible: boolean };

export function usePromptToCreateContentExperiment(): UsePromptToCreateContentExperimentReturnType {
  const variant = useExperimentVariant(
    "slicemachine-prompt-to-create-document",
  );

  // we serve the previous version only to users in the "control" group
  // users in:
  // - variant value "on"
  // - out of experiment scope (variant value "off"),
  // - with telemetry deactivated (undefined)
  // will see the new version
  return {
    eligible: variant?.value !== "control",
  };
}
