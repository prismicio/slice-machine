import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useMemo,
} from "react";

import { useOnboardingExperiment } from "@/features/onboarding/useOnboardingExperiment";
import { usePersistedState } from "@/hooks/usePersistedState";

type InAppGuideContextValue = {
  isInAppGuideOpen: boolean;
  setIsInAppGuideOpen: Dispatch<SetStateAction<boolean>>;
};

export const InAppGuideContext = createContext<
  InAppGuideContextValue | undefined
>(undefined);

export const InAppGuideProvider: FC<PropsWithChildren> = (props) => {
  const { children } = props;
  const { eligible: isNewOnboardingEnabled } = useOnboardingExperiment();
  const [isInAppGuideOpen, setIsInAppGuideOpen] = usePersistedState(
    "isInAppGuideOpen",
    true,
  );

  const memoizedValue = useMemo(() => {
    if (isNewOnboardingEnabled) {
      return { isInAppGuideOpen: false, setIsInAppGuideOpen: () => undefined };
    }
    return { isInAppGuideOpen, setIsInAppGuideOpen };
  }, [isInAppGuideOpen, setIsInAppGuideOpen, isNewOnboardingEnabled]);

  return (
    <InAppGuideContext.Provider value={memoizedValue}>
      {children}
    </InAppGuideContext.Provider>
  );
};

export const useInAppGuide = () => {
  const context = useContext(InAppGuideContext);
  if (context === undefined) {
    throw new Error("useInAppGuide must be used within an InAppGuideProvider");
  }
  return context;
};
