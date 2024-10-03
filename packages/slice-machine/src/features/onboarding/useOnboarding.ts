import { OnboardingStepId } from "@prismicio/editor-fields";
import { updateData, useRequest } from "@prismicio/editor-support/Suspense";

import { managerClient } from "@/managerClient";

async function getOnboarding() {
  try {
    return await managerClient.prismicRepository.fetchOnboarding();
  } catch (e) {
    console.error("Error while trying to get onboarding", e);
    return undefined;
  }
}

export function useOnboarding() {
  const onboarding = useRequest(getOnboarding, []);

  async function toggleStep(stepId: OnboardingStepId) {
    if (!onboarding) return [];

    const previousSteps = onboarding.completedSteps;

    const newSteps = previousSteps.includes(stepId)
      ? previousSteps.filter((id) => id !== stepId)
      : [...previousSteps, stepId];

    updateData(getOnboarding, [], {
      ...onboarding,
      completedSteps: newSteps,
    });

    try {
      const { completedSteps } =
        await managerClient.prismicRepository.toggleOnboardingStep(stepId);

      updateData(getOnboarding, [], {
        ...onboarding,
        completedSteps,
      });

      return completedSteps;
    } catch (err) {
      console.error("Error toggling step:", err);

      updateData(getOnboarding, [], {
        ...onboarding,
        completedSteps: previousSteps,
      });

      return previousSteps;
    }
  }

  async function toggleGuide() {
    if (!onboarding) return;
    try {
      const { isDismissed } =
        await managerClient.prismicRepository.toggleOnboarding();

      updateData(getOnboarding, [], {
        ...onboarding,
        isDismissed,
      });
    } catch (err) {
      console.error("Error toggling onboarding:", err);
    }
  }

  return { onboarding, toggleStep, toggleGuide };
}
