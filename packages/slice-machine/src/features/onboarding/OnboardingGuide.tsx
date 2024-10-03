import { useOnboardingExperiment } from "@/features/onboarding/useOnboardingExperiment";
import { useUpdateAvailable } from "@/hooks/useUpdateAvailable";

import { SharedOnboardingGuide } from "./SharedOnboardingGuide";
import { SliceMachineOnboardingGuide } from "./SliceMachineOnboardingGuide/SliceMachineOnboardingGuide";
import { useSharedOnboardingExperiment } from "./useSharedOnboardingExperiment";

export function OnboardingGuide() {
  const { eligible } = useOnboardingExperiment();
  const { isSharedOnboardingExperimentEligible } =
    useSharedOnboardingExperiment();
  const { sliceMachineUpdateAvailable, adapterUpdateAvailable } =
    useUpdateAvailable();

  if (!eligible || sliceMachineUpdateAvailable || adapterUpdateAvailable) {
    return null;
  }

  return isSharedOnboardingExperimentEligible ? (
    <SharedOnboardingGuide />
  ) : (
    <SliceMachineOnboardingGuide />
  );
}
