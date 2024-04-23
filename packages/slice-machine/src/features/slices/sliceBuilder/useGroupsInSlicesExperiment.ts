import { useExperimentVariant } from "@src/hooks/useExperimentVariant";

type UseGitIntegrationExperimentReturnType = { eligible: boolean };

export function useGroupsInSlicesExperiment(): UseGitIntegrationExperimentReturnType {
  const variant = useExperimentVariant("slicemachine-groups-in-slices");
  return { eligible: variant?.value === "on" };
}
