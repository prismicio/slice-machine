import type { FC, ReactNode } from "react";
import { useDispatch } from "react-redux";

import { ComponentUI } from "@lib/models/common/ComponentUI";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getLibraries } from "@src/modules/slices";
import Router from "next/router";
import { replace } from "connected-next-router";

type Props = Readonly<{
  children?: ReactNode | ((slice: ComponentUI) => ReactNode);
}>;

export const SliceHandler: FC<Props> = ({ children }) => {
  const dispatch = useDispatch();

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
    dispatch(replace("/"));
    return null;
  }

  const slice = lib.components.find(
    (state) => state.model.name === urlSliceName
  );

  if (!slice) {
    dispatch(replace("/"));
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
    dispatch(replace("/"));
    return null;
  }

  // variation not in the URL but a default variation was found
  if (!variationParam) {
    dispatch(replace(`/${lib.name}/${slice.model.name}/${variation.id}`));
  }

  return <>{typeof children === "function" ? children(slice) : children}</>;
};
