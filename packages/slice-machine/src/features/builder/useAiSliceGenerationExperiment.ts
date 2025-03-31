import { useExperimentVariant } from "@/hooks/useExperimentVariant";

type useAiSliceGenerationExperimentReturnType = { eligible: boolean };

export function useAiSliceGenerationExperiment(): useAiSliceGenerationExperimentReturnType {
  const variant = useExperimentVariant("slicemachine-image-to-slice");
  return { eligible: variant?.value === "on" };
}
