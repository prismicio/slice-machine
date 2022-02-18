export type UserContextStoreType = {
  hasSendAReview: boolean;
  isOnboarded: boolean;
  updatesViewed: {
    latest: string | null;
    latestNonBreaking: string | null;
  };
};
