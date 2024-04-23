import { FC } from "react";
import { useSelector } from "react-redux";

import { useInAppGuide } from "@/features/inAppGuide/InAppGuideContext";
import { hasLocal } from "@/legacy/lib/models/common/ModelData";
import { selectAllCustomTypes } from "@/modules/availableCustomTypes";
import { getLibraries } from "@/modules/slices";
import { getLastSyncChange, getUserReview } from "@/modules/userContext";
import { SliceMachineStoreType } from "@/redux/type";

import { ReviewForm } from "./ReviewForm";

export const ReviewModal: FC = () => {
  const { isInAppGuideOpen } = useInAppGuide();
  const { userReview, customTypes, libraries, lastSyncChange } = useSelector(
    (store: SliceMachineStoreType) => ({
      userReview: getUserReview(store),
      customTypes: selectAllCustomTypes(store),
      libraries: getLibraries(store),
      lastSyncChange: getLastSyncChange(store),
    }),
  );

  // Opt out directly if the in-app guide is open
  if (isInAppGuideOpen) {
    return null;
  }

  const sliceCount =
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    libraries && libraries.length
      ? libraries.reduce((count, lib) => {
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          if (!lib) return count;
          return count + lib.components.length;
        }, 0)
      : 0;

  const hasSliceWithinCustomType = customTypes.some(
    (customType) =>
      hasLocal(customType) &&
      customType.local.tabs.some(
        (tab) => tab.sliceZone && tab.sliceZone?.value.length > 0,
      ),
  );

  const hasPushedAnHourAgo = Boolean(
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    lastSyncChange && Date.now() - lastSyncChange >= 3600000,
  );

  const isAdvancedRepository =
    sliceCount >= 6 &&
    customTypes.length >= 6 &&
    hasSliceWithinCustomType &&
    hasPushedAnHourAgo;

  if (!userReview.advancedRepository && isAdvancedRepository) {
    return <ReviewForm reviewType="advancedRepository" />;
  }

  const isOnboardingDone =
    sliceCount >= 1 &&
    customTypes.length >= 1 &&
    hasSliceWithinCustomType &&
    hasPushedAnHourAgo;

  if (
    !userReview.onboarding &&
    !userReview.advancedRepository &&
    isOnboardingDone
  ) {
    return <ReviewForm reviewType="onboarding" />;
  }

  return null;
};
