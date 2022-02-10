export type UserContextStoreType = {
  hasSendAReview: boolean;
  isOnboarded: boolean;
  viewedUpdates: {
    patch: string | null;
    minor: string | null;
    major: string | null;
  };
};
