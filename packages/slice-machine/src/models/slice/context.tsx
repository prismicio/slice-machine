import React from "react";

import SliceState from "@lib/models/ui/SliceState";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { SliceSM } from "@slicemachine/core/build/models/Slice";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getLibrariesState } from "@src/modules/slices";
import Router from "next/router";
import { replace } from "connected-next-router";

export function useModelReducer({
  slice,
  remoteSlice,
  mockConfig,
}: {
  slice: ComponentUI;
  remoteSlice?: SliceSM;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockConfig: any;
}): SliceState {
  const { model, ...rest } = slice;

  const initialState: SliceState = {
    model,
    ...rest,
    variations: model.variations,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    mockConfig,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    initialMockConfig: mockConfig,
    remoteVariations: remoteSlice ? remoteSlice.variations : [],
    initialScreenshotUrls: rest.screenshotUrls,
    initialVariations: model.variations,
  };

  return initialState;
}

export const SliceHandler: React.FC = ({ children }) => {
  const { libraries } = useSelector((state: SliceMachineStoreType) => ({
    libraries: getLibrariesState(state),
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
      const maybeVariation = SliceState.variation(slice, variationParam);
      if (!maybeVariation) return SliceState.variation(slice);
      else return maybeVariation;
    } else {
      return SliceState.variation(slice);
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
