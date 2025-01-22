import { useExperimentVariant } from "@/hooks/useExperimentVariant";

type UseTableFieldExperimentReturnType = { eligible: boolean };

export function useTableFieldExperiment(): UseTableFieldExperimentReturnType {
  const variant = useExperimentVariant("slicemachine-table-field");
  return { eligible: variant?.value === "on" };
}
