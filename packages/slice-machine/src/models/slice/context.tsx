import React from "react";
import { useRouter } from "next/router";

import SliceState from "@lib/models/ui/SliceState";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { SliceSM } from "@slicemachine/core/build/models/Slice";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getLibrariesState } from "@src/modules/slices";

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

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
export const SliceHandler = ({ children }: { children: any }) => {
  const router = useRouter();
  const { libraries } = useSelector((state: SliceMachineStoreType) => ({
    libraries: getLibrariesState(state),
  }));

  if (!router.query || !router.query.lib || !router.query.sliceName) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return children;
  }

  const libParam: string = (() => {
    const l = router.query.lib;
    if (l instanceof Array) return l[0];
    else return l;
  })();

  const lib = libraries?.find((l) => l?.name === libParam.replace(/--/g, "/"));
  if (!lib) {
    void router.replace("/");
    return null;
  }

  const slice = lib.components.find(
    (state) => state.model.name === router.query.sliceName
  );

  if (!slice) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    router.replace("/");
    return null;
  }

  const variationParam: string | undefined = (() => {
    const l = router.query.variation;
    if (l instanceof Array) return l[0];
    else return l;
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
    void router.replace("/");
    return null;
  }

  // variation not in the URL but a default variation was found
  if (!variationParam) {
    void router.replace(`/${lib.name}/${slice.model.name}/${variation.id}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return <>{typeof children === "function" ? children(slice) : children}</>;
};
