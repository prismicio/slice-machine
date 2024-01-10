import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/router";

import {
  AutoSaveStatusType,
  useAutoSave,
} from "@src/features/autoSave/useAutoSave";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { readSliceMocks, updateSlice } from "@src/apiClient";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { VariationSM } from "@lib/models/common/Slice";

type SliceContext = {
  slice: ComponentUI;
  autoSaveStatus: AutoSaveStatusType;
  setSlice: Dispatch<SetStateAction<ComponentUI>>;
  variation: VariationSM;
};

type SliceBuilderProviderProps = {
  children: ReactNode | ((value: SliceContext) => ReactNode);
  defaultSlice: ComponentUI;
};

const SliceContextValue = createContext<SliceContext>({
  autoSaveStatus: "saved",
  slice: {} as ComponentUI,
  setSlice: () => void 0,
  variation: {} as VariationSM,
});

export function SliceBuilderProvider(props: SliceBuilderProviderProps) {
  const { children, defaultSlice } = props;
  const isMounted = useRef(false);
  const [slice, setSlice] = useState(defaultSlice);
  const { autoSaveStatus, setNextSave } = useAutoSave({
    errorMessage: "Failed to save slice, check console logs.",
  });
  const { saveSliceSuccess } = useSliceMachineActions();
  const router = useRouter();

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

  useEffect(
    () => {
      // Prevent a save to be triggered on first render
      if (isMounted.current) {
        setNextSave(async () => {
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

          saveSliceSuccess({ ...slice, mocks });
        });
      } else {
        isMounted.current = true;
      }
    },
    // Prevent saveSliceSuccess to trigger infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slice, setNextSave],
  );

  const contextValue: SliceContext = useMemo(
    () => ({
      autoSaveStatus,
      slice,
      setSlice,
      variation,
    }),
    [autoSaveStatus, slice, setSlice, variation],
  );

  return (
    <SliceContextValue.Provider value={contextValue}>
      {typeof children === "function" ? children(contextValue) : children}
    </SliceContextValue.Provider>
  );
}

export function useSliceState() {
  return useContext(SliceContextValue);
}
