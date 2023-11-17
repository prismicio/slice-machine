import {
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
} from "react";

import { usePersistedState } from "@src/hooks/usePersistedState";

import { InAppGuideDialog } from "./InAppGuideDialog";

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
    true,
    "isInAppGuideOpen",
  );

  return (
    <InAppGuideContext.Provider
      value={{
        isInAppGuideOpen,
        setIsInAppGuideOpen,
      }}
    >
      {children}
      <InAppGuideDialog />
    </InAppGuideContext.Provider>
  );
};

export const useInAppGuide = () => {
  const context = useContext(InAppGuideContext);
  if (context === undefined) {
    throw new Error("useInAppGuide must be used within a InAppGuideProvider");
  }
  return context;
};
