import { useExperimentVariant } from "@src/hooks/useExperimentVariant";

type UseGitIntegrationExperimentReturnType = { eligible: boolean };

export function useGitIntegrationExperiment(): UseGitIntegrationExperimentReturnType {
  const variant = useExperimentVariant("slicemachine-git-integration");
  return { eligible: variant?.value === "on" };
}
