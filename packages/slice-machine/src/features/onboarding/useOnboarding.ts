import { OnboardingState, OnboardingStepId } from "@prismicio/editor-fields";
import { useRefGetter } from "@prismicio/editor-support/React";
import { updateData, useRequest } from "@prismicio/editor-support/Suspense";
import { toast } from "react-toastify";

import { useSharedOnboardingExperiment } from "@/features/onboarding/useSharedOnboardingExperiment";
import { managerClient } from "@/managerClient";

const { fetchOnboarding, toggleOnboarding, toggleOnboardingStep } =
  managerClient.prismicRepository;

async function getOnboarding() {
  try {
    return await fetchOnboarding();
  } catch (error) {
    console.error("Failed to fetch onboarding", error);
    return undefined;
  }
}

const noop = () => Promise.resolve(undefined);

export function useOnboarding() {
  const isSharedExperimentEligible = useSharedOnboardingExperiment().eligible;
  const onboarding = useRequest(
    isSharedExperimentEligible ? getOnboarding : noop,
    [],
  );
  const getOnboardingState = useRefGetter(onboarding);

  function updateCache(newOnboardingState: OnboardingState) {
    updateData(getOnboarding, [], newOnboardingState);
  }

  async function toggleStep(stepId: OnboardingStepId) {
    if (!isSharedExperimentEligible) return [];

    const onboardingState = getOnboardingState();
    if (!onboardingState) return [];

    try {
      const { completedSteps } = await toggleOnboardingStep(String(stepId));
      updateCache({ ...onboardingState, completedSteps });

      return completedSteps;
    } catch (error) {
      toast.error("Failed to complete/undo step");
      console.error("Failed to toggle onboarding step", error);

      return onboardingState.completedSteps;
    }
  }

  async function toggleGuide() {
    if (!isSharedExperimentEligible) return;

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
      console.error("Failed to toggle onboarding", error);
    }
  }

  async function completeStep(stepId: OnboardingStepId) {
    if (!isSharedExperimentEligible) return;

    const onboardingState = getOnboardingState();
    if (!onboardingState) return;

    try {
      // TODO: Refactor when the API has complete action (DT-2389)
      if (!onboardingState.completedSteps.includes(String(stepId))) {
        await toggleStep(stepId);
      }
    } catch (error) {
      toast.error("Failed to complete onboarding step");
      console.error("Failed to complete onboarding step", error);
    }
  }

  return { onboarding, toggleStep, completeStep, toggleGuide };
}
