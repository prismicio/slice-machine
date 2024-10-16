import { updateData, useRequest } from "@prismicio/editor-support/Suspense";

import { managerClient } from "@/managerClient";

const { fetchOnboarding, toggleOnboarding, toggleOnboardingStep } =
  managerClient.prismicRepository;

async function getOnboarding() {
  try {
    return await fetchOnboarding();
  } catch (error) {
    console.error("Error while trying to get onboarding", error);
    return undefined;
  }
}

export function useOnboarding() {
  const onboarding = useRequest(getOnboarding, []);

  async function toggleStep(stepId: string) {
    if (!onboarding) return [];

    try {
      const { completedSteps } = await toggleOnboardingStep(stepId);
      updateData(getOnboarding, [], { ...onboarding, completedSteps });

      return completedSteps;
    } catch (error) {
      console.error("Error toggling step:", error);

      return onboarding.completedSteps;
    }
  }

  async function toggleGuide() {
    if (!onboarding) return;
    try {
      const { isDismissed } = await toggleOnboarding();
      updateData(getOnboarding, [], { ...onboarding, isDismissed });
    } catch (error) {
      console.error("Error toggling onboarding:", error);
    }
  }

  return { onboarding, toggleStep, toggleGuide };
}
