import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import { VariationSM } from "@/legacy/lib/models/common/Slice";
import { selectCurrentSlice } from "@/modules/slices/selector";
import { SliceMachineStoreType } from "@/redux/type";

type UseCurrentSliceRet = { slice?: ComponentUI; variation?: VariationSM };

const useCurrentSlice = (): UseCurrentSliceRet => {
  const router = useRouter();

  const { slice } = useSelector((store: SliceMachineStoreType) => ({
    slice: selectCurrentSlice(
      store,
      router.query.lib as string,
      router.query.sliceName as string,
    ),
  }));

  if (!slice) {
    return {};
  }

  const variation = slice.model.variations.find(
    (variation) => variation.id === router.query.variation,
  );

  if (!variation) {
    return {};
  }

  return { slice, variation };
};

export default useCurrentSlice;
