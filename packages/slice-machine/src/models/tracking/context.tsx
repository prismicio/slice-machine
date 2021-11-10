import React, { useContext, useEffect, useState } from "react";
import ReviewModal from "@components/ReviewModal";
import { CustomTypesContext } from "@src/models/customTypes/context";
import { LibrariesContext } from "@src/models/libraries/context";
import { sendTrackingReview } from "@src/apiClient";
import { useDispatch } from "react-redux";
import { ModalKeysEnum, modalOpenCreator } from "@src/modules/modal";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import {
  startLoadingActionCreator,
  stopLoadingActionCreator,
} from "@src/modules/loading";
import { useToasts } from "react-toast-notifications";

function returnInitialState<S>(storageKey: string, initialValue: S): S {
  try {
    const item = window.localStorage.getItem(storageKey);
    return item ? (JSON.parse(item) as S) : initialValue;
  } catch (error) {
    return initialValue;
  }
}

function useLocalStorage<S>(
  storageKey: string,
  initialValue: S
): [S, (value: S) => void] {
  const [storedValue, setStoredValue] = useState(
    returnInitialState<S>(storageKey, initialValue)
  );

  const setValue = (value: S) => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
      setStoredValue(value);
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

export const TrackingContext = React.createContext<{
  hasSendAReview: boolean;
  onSendAReview: (rating: number, comment: string) => void;
  onSkipReview: () => void;
}>({
  hasSendAReview: false,
  onSendAReview: () => null,
  onSkipReview: () => null,
});

const TrackingProvider: React.FunctionComponent = ({ children }) => {
  const [trackingStore, setTrackingStore] = useLocalStorage<{
    hasSendAReview: boolean;
  }>("tracking", {
    hasSendAReview: false,
  });

  useEffect(() => {
    // We store the value in the local storage if this not done
    setTrackingStore(trackingStore);
  });

  const dispatch = useDispatch();
  const { customTypes } = useContext(CustomTypesContext);
  const libraries = useContext(LibrariesContext);
  const openLogin = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }));
  const startReviewLoading = () =>
    dispatch(startLoadingActionCreator({ key: LoadingKeysEnum.REVIEW }));
  const stopReviewLoading = () =>
    dispatch(stopLoadingActionCreator({ key: LoadingKeysEnum.REVIEW }));

  const { addToast } = useToasts();

  const sliceCount =
    libraries && libraries.length
      ? libraries.reduce((count, lib) => {
          if (!lib) {
            return count;
          }

          return count + lib.components.length;
        }, 0)
      : 0;

  const customTypeCount = !!customTypes ? customTypes.length : 0;
  // Deactivate for this release
  const userHasCreateEnoughContent =
    sliceCount >= 1 && customTypeCount >= 1 && false;

  const onSendAReview = async (
    rating: number,
    comment: string
  ): Promise<void> => {
    try {
      startReviewLoading();
      await sendTrackingReview(rating, comment);
      setTrackingStore({
        ...trackingStore,
        hasSendAReview: true,
      });
      stopReviewLoading();
    } catch (error) {
      stopReviewLoading();
      if (403 === error.response?.status) {
        openLogin();
      }
      if (401 === error.response?.status) {
        addToast("You don't have access to the repo", { appearance: "error" });
      }
    }
  };

  const onSkipReview = () => {
    setTrackingStore({
      ...trackingStore,
      hasSendAReview: true,
    });
  };

  return (
    <TrackingContext.Provider
      value={{
        hasSendAReview: trackingStore.hasSendAReview,
        onSendAReview,
        onSkipReview,
      }}
    >
      {children}
      <ReviewModal
        isOpen={userHasCreateEnoughContent && !trackingStore.hasSendAReview}
        onSubmit={onSendAReview}
        close={onSkipReview}
      />
    </TrackingContext.Provider>
  );
};

export default TrackingProvider;
