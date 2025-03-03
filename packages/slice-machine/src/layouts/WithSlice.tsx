import { replace } from "connected-next-router";
import { AppProps } from "next/app";
import React, { ReactNode } from "react";

import useCurrentSlice from "@/hooks/useCurrentSlice";
import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import { VariationSM } from "@/legacy/lib/models/common/Slice";

export type ComponentWithSliceProps = React.FC<{
  slice: ComponentUI;
  variation: VariationSM;
}>;

export const createComponentWithSlice = (C: ComponentWithSliceProps) => {
  const Wrapper: React.FC<{ pageProps?: AppProps }> & {
    CustomLayout?: React.FC<{ children: ReactNode }>;
  } = ({ pageProps }) => {
    const { slice, variation } = useCurrentSlice();
    if (!slice || !variation) {
      void replace("/");
      return null;
    }
    return <C slice={slice} variation={variation} {...pageProps} />;
  };
  return Wrapper;
};
