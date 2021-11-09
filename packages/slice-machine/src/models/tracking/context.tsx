import React, { useContext, useEffect, useState } from "react";
import ReviewModal from "@components/ReviewModal";
import { CustomTypesContext } from "@src/models/customTypes/context";
import { LibrariesContext } from "@src/models/libraries/context";
import { LoginModalContext } from "@src/LoginModalProvider";
import { sendTrackingReview } from "@src/apiClient";
import { AxiosError } from "axios";

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

  const { customTypes } = useContext(CustomTypesContext);
  const libraries = useContext(LibrariesContext);
  const { openLogin } = useContext(LoginModalContext);

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
      await sendTrackingReview(rating, comment);
      setTrackingStore({
        ...trackingStore,
        hasSendAReview: true,
      });
    } catch (error: AxiosError) {
      if (403 === error.response?.status || 401 === error.response?.status) {
        openLogin();
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
