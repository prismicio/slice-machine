import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useMemo,
} from "react";

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
  const [isInAppGuideOpen, setIsInAppGuideOpen] = usePersistedState(
    "isInAppGuideOpen",
    true,
  );

  const memoizedValue = useMemo(
    () => ({ isInAppGuideOpen, setIsInAppGuideOpen }),
    [isInAppGuideOpen, setIsInAppGuideOpen],
  );

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
