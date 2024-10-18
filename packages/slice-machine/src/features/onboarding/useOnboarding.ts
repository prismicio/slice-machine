import { OnboardingState } from "@prismicio/editor-fields";
import { useRefGetter } from "@prismicio/editor-support/React";
import { updateData, useRequest } from "@prismicio/editor-support/Suspense";
import { toast } from "react-toastify";

import { managerClient } from "@/managerClient";

const { fetchOnboarding, toggleOnboarding, toggleOnboardingStep } =
  managerClient.prismicRepository;

async function getOnboarding() {
  try {
    return fetchOnboarding();
  } catch (error) {
    console.error("Failed to fetch onboarding", error);
    return undefined;
  }
}

export function useOnboarding() {
  const onboarding = useRequest(getOnboarding, []);
  const getOnboardingState = useRefGetter(onboarding);

  function updateCache(newOnboardingState: OnboardingState) {
    updateData(getOnboarding, [], newOnboardingState);
  }

  async function toggleStep(stepId: string) {
    const onboardingState = getOnboardingState();
    if (!onboardingState) return [];

    try {
      const { completedSteps } = await toggleOnboardingStep(stepId);
      updateCache({ ...onboardingState, completedSteps });

      return completedSteps;
    } catch (error) {
      toast.error("Failed to complete/undo step");
      console.error("Error toggling onboarding step", error);

      return onboardingState.completedSteps;
    }
  }

  async function toggleGuide() {
    const onboardingState = getOnboardingState();
    if (!onboardingState) return;

    const wasDismissed = onboardingState.isDismissed;
    try {
      updateCache({ ...onboardingState, isDismissed: !wasDismissed }); // optimistic
      const { isDismissed } = await toggleOnboarding();
      updateCache({ ...onboardingState, isDismissed }); // sync with api
    } catch (error) {
      updateCache({ ...onboardingState, isDismissed: wasDismissed }); // rollback
      toast.error("Failed to hide/show onboarding");
      console.error("Error toggling onboarding", error);
    }
  }

  return { onboarding, toggleStep, toggleGuide };
}
