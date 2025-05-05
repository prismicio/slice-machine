// import { useExperimentVariant } from "@/hooks/useExperimentVariant";

export type UseSectionsNamingExperimentReturnType = {
  eligible: boolean;
  value: string;
};

export function useSectionsNamingExperiment(): UseSectionsNamingExperimentReturnType {
  // const variant = useExperimentVariant("slicemachine-sections");
  // return variant?.value === "on"
  const eligible = false;
  return {
    eligible,
    value: eligible ? "section" : "slice",
  };
}
