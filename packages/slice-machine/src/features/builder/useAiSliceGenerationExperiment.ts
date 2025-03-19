import { useExperimentVariant } from "@/hooks/useExperimentVariant";

type useAiSliceGenerationExperimentReturnType = { eligible: boolean };

export function useAiSliceGenerationExperiment(): useAiSliceGenerationExperimentReturnType {
  const variant = useExperimentVariant("slicemachine-ai-slice-generation");
  return { eligible: variant?.value === "on" };
}
