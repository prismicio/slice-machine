import { useExperimentVariant } from "@/hooks/useExperimentVariant";

type UseNestedGroupExperimentReturnType = { eligible: boolean };

export function useNestedGroupExperiment(): UseNestedGroupExperimentReturnType {
  const variant = useExperimentVariant("slicemachine-nested-groups");
  return { eligible: variant?.value === "on" };
}
