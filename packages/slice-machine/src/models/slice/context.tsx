import type { FC, ReactNode } from "react";

import { ComponentUI } from "@lib/models/common/ComponentUI";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getLibraries } from "@src/modules/slices";
import { useRouter } from "next/router";

type Props = Readonly<{
  children?: ReactNode | ((slice: ComponentUI) => ReactNode);
}>;

export const SliceHandler: FC<Props> = ({ children }) => {
  const router = useRouter();

  const { libraries } = useSelector((state: SliceMachineStoreType) => ({
    libraries: getLibraries(state),
  }));

  const urlLib = router.query.lib;
  const urlSliceName = router.query.sliceName;
  const urlVariation = router.query.variation;

  const libParam = (() => {
    if (urlLib instanceof Array) return urlLib[0];
    else return urlLib;
  })();

  const lib = libraries?.find((l) => l?.name === libParam?.replace(/--/g, "/"));

  const slice = lib?.components.find(
    (state) => state.model.name === urlSliceName
  );

  const variationParam: string | undefined = (() => {
    if (urlVariation instanceof Array) return urlVariation[0];
    else return urlVariation;
  })();

  const variation = (() => {
    if (!slice) {
      return undefined;
    } else if (variationParam) {
      const maybeVariation = ComponentUI.variation(slice, variationParam);
      if (!maybeVariation) return ComponentUI.variation(slice);
      else return maybeVariation;
    } else {
      return ComponentUI.variation(slice);
    }
  })();

  // TODO: enabling these redirects will break the "A user can create and rename a slice" E2E test.
  // useEffect(() => {
  //   if (!lib) void router.replace("/");
  //   else if (!slice) void router.replace("/");
  //   else if (!variation) void router.replace("/");
  //   // variation not in the URL but a default variation was found
  //   else if (!variationParam)
  //     void router.replace(`/${lib.name}/${slice.model.name}/${variation.id}`);
  // }, [lib, slice, variation, variationParam]);

  if (!urlLib || !urlSliceName) {
    return <>{children}</>;
  }

  if (!lib || !slice || !variation) {
    return null;
  }

  return <>{typeof children === "function" ? children(slice) : children}</>;
};
