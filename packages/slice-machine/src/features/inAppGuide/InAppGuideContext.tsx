import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useState,
} from "react";

import { InAppGuideDialog } from "./InAppGuideDialog";

type InAppGuideContextValue = {
  isInAppGuideOpen: boolean;
  setIsInAppGuideOpen: (open: boolean) => void;
};

export const InAppGuideContext = createContext<
  InAppGuideContextValue | undefined
>(undefined);

export const InAppGuideProvider: FC<PropsWithChildren> = (props) => {
  const { children } = props;
  const [isInAppGuideOpen, setIsInAppGuideOpen] = useState(false);

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
