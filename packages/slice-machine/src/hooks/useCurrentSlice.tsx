import { ComponentUI } from "@lib/models/common/ComponentUI";
import { VariationSM } from "@lib/models/common/Slice";
import { selectCurrentSlice } from "@src/modules/selectedSlice/selectors";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { SliceMachineStoreType } from "@src/redux/type";

import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSelector } from "react-redux";

type UseCurrentSliceRet = { slice?: ComponentUI; variation?: VariationSM };

const useCurrentSlice = (): UseCurrentSliceRet => {
  const router = useRouter();
  const { initSliceStore } = useSliceMachineActions();

  const { slice } = useSelector((store: SliceMachineStoreType) => ({
    slice: selectCurrentSlice(
      store,
      router.query.lib as string,
      router.query.sliceName as string
    ),
  }));

  useEffect(() => {
    if (slice) {
      initSliceStore(slice);
    } else {
      void router.replace("/");
    }
  }, [initSliceStore, slice, router]);

  if (!slice) {
    return {};
  }

  const variation = slice.model.variations.find(
    (variation) => variation.id === router.query.variation
  );

  if (!variation) {
    void router.replace("/");
    return {};
  }

  return { slice, variation };
};

export default useCurrentSlice;
