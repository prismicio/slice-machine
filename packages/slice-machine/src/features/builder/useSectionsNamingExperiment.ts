// import { useExperimentVariant } from "@/hooks/useExperimentVariant";

export type useSectionsNamingExperimentReturnType = {
  eligible: boolean;
  value: string;
};

export function useSectionsNamingExperiment(): useSectionsNamingExperimentReturnType {
  // const variant = useExperimentVariant("slicemachine-sections");
  // return variant?.value === "on"
  const eligible = false;
  return {
    eligible,
    value: eligible ? "section" : "slice",
  };
}
