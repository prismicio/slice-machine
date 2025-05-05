// import { useExperimentVariant } from "@/hooks/useExperimentVariant";

export type UseSectionsExperimentReturnType = {
  eligible: boolean;
  singular: {
    uppercase: string;
    lowercase: string;
  };
  plural: {
    uppercase: string;
    lowercase: string;
  };
};

export function useSectionsExperiment(): UseSectionsExperimentReturnType {
  // const variant = useExperimentVariant("slicemachine-sections");
  // return variant?.value === "on"
  return false
    ? {
        eligible: true,
        singular: { uppercase: "Section", lowercase: "section" },
        plural: { uppercase: "Sections", lowercase: "sections" },
      }
    : {
        eligible: false,
        singular: { uppercase: "Slice", lowercase: "slice" },
        plural: { uppercase: "Slices", lowercase: "slices" },
      };
}
