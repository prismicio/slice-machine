import { useStableCallback } from "@prismicio/editor-support/React";
import { useRouter } from "next/router";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { readSliceMocks, updateSlice } from "@/apiClient";
import { useAutoSync } from "@/features/sync/AutoSyncProvider";
import { ActionQueueStatus, useActionQueue } from "@/hooks/useActionQueue";
import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import { VariationSM } from "@/legacy/lib/models/common/Slice";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

type SliceContext = {
  slice: ComponentUI;
  actionQueueStatus: ActionQueueStatus;
  setSlice: (slice: ComponentUI) => void;
  variation: VariationSM;
};

type SliceBuilderProviderProps = {
  children: ReactNode | ((value: SliceContext) => ReactNode);
  initialSlice: ComponentUI;
};

const SliceContextValue = createContext<SliceContext | undefined>(undefined);

export function SliceBuilderProvider(props: SliceBuilderProviderProps) {
  const { children, initialSlice } = props;

  const router = useRouter();
  const [slice, setSliceState] = useState(initialSlice);
  const { actionQueueStatus, setNextAction } = useActionQueue({
    errorMessage:
      "Failed to save slice. Check your browser's console for more information.",
  });
  const { saveSliceSuccess } = useSliceMachineActions();
  const stableSaveSliceSuccess = useStableCallback(saveSliceSuccess);
  const { syncChanges } = useAutoSync();

  const variation = useMemo(() => {
    const variationName = router.query.variation;
    const v = slice.model.variations.find(
      (variation) => variation.id === variationName,
    );

    if (v) {
      return v;
    }

    throw new Error("Variation not found");
  }, [slice, router]);

  const setSlice = useCallback(
    (slice: ComponentUI) => {
      setSliceState(slice);
      setNextAction(async () => {
        const { errors: updateSliceErrors } = await updateSlice(slice);

        if (updateSliceErrors.length > 0) {
          throw updateSliceErrors;
        }

        const { errors: readSliceMockErrors, mocks } = await readSliceMocks({
          libraryID: slice.from,
          sliceID: slice.model.id,
        });

        if (readSliceMockErrors.length > 0) {
          throw readSliceMockErrors;
        }

        // Update slices store with new slice
        stableSaveSliceSuccess({ ...slice, mocks });

        syncChanges();
      });
    },
    [setNextAction, stableSaveSliceSuccess, syncChanges],
  );

  const contextValue: SliceContext = useMemo(
    () => ({
      actionQueueStatus,
      slice,
      setSlice,
      variation,
    }),
    [actionQueueStatus, slice, setSlice, variation],
  );

  return (
    <SliceContextValue.Provider value={contextValue}>
      {typeof children === "function" ? children(contextValue) : children}
    </SliceContextValue.Provider>
  );
}

export function useSliceState() {
  const sliceState = useContext(SliceContextValue);

  if (!sliceState) {
    throw new Error("SliceBuilderProvider not found");
  }

  return sliceState;
}
