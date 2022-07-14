import React from "react";

import { ComponentUI } from "@lib/models/common/ComponentUI";
import { SliceSM } from "@slicemachine/core/build/models/Slice";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getLibraries } from "@src/modules/slices";
import Router from "next/router";
import { replace } from "connected-next-router";
import { ExtendedComponentUI } from "@src/modules/selectedSlice/types";
import { CustomTypeMockConfig } from "@lib/models/common/MockConfig";

export function useModelReducer({
  slice,
  remoteSlice,
  mockConfig,
}: {
  slice: ComponentUI;
  remoteSlice?: SliceSM;
  mockConfig: CustomTypeMockConfig;
}): ExtendedComponentUI {
  const extendedComponentUI: ExtendedComponentUI = {
    component: slice,
    mockConfig: mockConfig,
    initialMockConfig: mockConfig,
    remoteVariations: remoteSlice ? remoteSlice.variations : [],
    initialVariations: slice.model.variations,
    initialScreenshotUrls: slice.screenshotUrls,
  };

  return extendedComponentUI;
}

export const SliceHandler: React.FC = ({ children }) => {
  const { libraries } = useSelector((state: SliceMachineStoreType) => ({
    libraries: getLibraries(state),
  }));

  const urlLib = Router.router?.query?.lib;
  const urlSliceName = Router.router?.query?.sliceName;
  const urlVariation = Router.router?.query?.variation;

  if (!urlLib || !urlSliceName) {
    return <>{children}</>;
  }

  const libParam: string = (() => {
    if (urlLib instanceof Array) return urlLib[0];
    else return urlLib;
  })();

  const lib = libraries?.find((l) => l?.name === libParam.replace(/--/g, "/"));
  if (!lib) {
    void replace("/");
    return null;
  }

  const slice = lib.components.find(
    (state) => state.model.name === urlSliceName
  );

  if (!slice) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    replace("/");
    return null;
  }

  const variationParam: string | undefined = (() => {
    if (urlVariation instanceof Array) return urlVariation[0];
    else return urlVariation;
  })();
  const variation = (() => {
    if (variationParam) {
      const maybeVariation = ComponentUI.variation(slice, variationParam);
      if (!maybeVariation) return ComponentUI.variation(slice);
      else return maybeVariation;
    } else {
      return ComponentUI.variation(slice);
    }
  })();

  if (!variation) {
    replace("/");
    return null;
  }

  // variation not in the URL but a default variation was found
  if (!variationParam) {
    replace(`/${lib.name}/${slice.model.name}/${variation.id}`);
  }

  return <>{typeof children === "function" ? children(slice) : children}</>;
};
