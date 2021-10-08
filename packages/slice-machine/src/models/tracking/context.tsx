import React, { useContext, useState } from "react";
import { fetchApi } from "@builders/common/fetch";
import ReviewModal from "@components/ReviewModal";
import { CustomTypesContext } from "@src/models/customTypes/context";
import { LibrariesContext } from "@src/models/libraries/context";

const returnInitialState = (storageKey: string) => {
  try {
    const item = window.localStorage.getItem(storageKey);
    return item ? JSON.parse(item) : {};
  } catch (error) {
    console.log(error);
    return {};
  }
};

function useLocalStorage<S>(
  storageKey: string,
  initialValue: S
): [S, (value: S) => void] {
  const [storedValue, setStoredValue] = useState(
    returnInitialState(storageKey)
  );

  const setValue = (value: any) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save to local storage
      window.localStorage.setItem(storageKey, JSON.stringify(valueToStore));
      // Save state
      setStoredValue(valueToStore);
    } catch (error) {
      console.log(error);
    }
  };

  if (storedValue && Object.keys(storedValue).length === 0) {
    setValue(initialValue);
  }

  return [storedValue, setValue];
}

export const TrackingContext = React.createContext<{
  hasSendAReview: boolean;
  onSendAReview: (rating: number, comment: string) => void;
  onSkipReview: () => void;
}>({
  hasSendAReview: false,
  onSendAReview: () => {},
  onSkipReview: () => {},
});

const TrackingProvider: React.FunctionComponent = ({ children }) => {
  const [trackingStore, setTrackingStore] = useLocalStorage<{
    hasSendAReview: boolean;
  }>("tracking", {
    hasSendAReview: false,
  });

  const { customTypes } = useContext(CustomTypesContext);
  const libraries = useContext(LibrariesContext);

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
  const userHasCreateEnoughContent = sliceCount >= 1 && customTypeCount >= 1;

  const onSendAReview = async (rating: number, comment: string) => {
    fetchApi({
      url: `/api/tracking/review`,
      params: {
        method: "POST",
        body: JSON.stringify({
          rating,
          comment,
        }),
      },
      setData: () => {},
      successMessage: "Thank you for your review",
      onSuccess() {
        setTrackingStore({
          ...trackingStore,
          hasSendAReview: true,
        });
      },
    });
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
