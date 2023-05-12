import React, { ReactNode } from "react";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { VariationSM } from "@lib/models/common/Slice";
import useCurrentSlice from "@src/hooks/useCurrentSlice";
import { AppProps } from "next/app";

import { replace } from "connected-next-router";

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
