import React, { useState } from "react";

const returnInitialState = (storageKey: string) => {
  try {
    const item = window.localStorage.getItem(storageKey);
    return item ? JSON.parse(item) : {};
  } catch (error) {
    console.log(error);
    return {};
  }
};

const useLocalStorage = (storageKey: string, initialValue: any) => {
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
};

export const TrackingContext = React.createContext<{
  hasSendAReview: false;
  onSendAReview: () => void;
  onSkipReview: () => void;
}>({
  hasSendAReview: false,
  onSendAReview: () => {},
  onSkipReview: () => {},
});

export default function TrackingProvider({ children }: { children: any }) {
  const [trackingStore, setTrackingStore] = useLocalStorage("tracking", {
    hasSendAReview: false,
  });

  const onSendAReview = () => {
    setTrackingStore({
      ...trackingStore,
      hasSendAReview: true,
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
    </TrackingContext.Provider>
  );
}
