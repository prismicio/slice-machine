import { useExperimentVariant } from "@/hooks/useExperimentVariant";

export type UseSectionsNamingExperimentReturnType = {
  eligible: boolean;
  value: string;
};

export function useSectionsNamingExperiment(): UseSectionsNamingExperimentReturnType {
  const variant = useExperimentVariant("section_greater_than_slice");
  const eligible = variant?.value === "treatment";
  return {
    eligible,
    value: eligible ? "section" : "slice",
  };
}
