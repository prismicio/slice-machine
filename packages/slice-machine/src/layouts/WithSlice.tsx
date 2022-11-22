import { ComponentUI } from "@lib/models/common/ComponentUI";
import { VariationSM } from "@slicemachine/core/build/models";
import useCurrentSlice from "@src/hooks/useCurrentSlice";
import { AppProps } from "next/app";

import { useRouter } from "next/router";
import React from "react";

export type ComponentWithSliceProps = React.FC<{
  slice: ComponentUI;
  variation: VariationSM;
}>;

export const createComponentWithSlice = (C: ComponentWithSliceProps) => {
  const Wrapper: React.FC<{ pageProps: AppProps }> & {
    CustomLayout?: React.FC;
  } = ({ pageProps }) => {
    const router = useRouter();
    const { slice, variation } = useCurrentSlice();
    if (!slice || !variation) {
      void router.replace("/");
      return null;
    }
    return <C slice={slice} variation={variation} {...pageProps} />;
  };
  return Wrapper;
};
