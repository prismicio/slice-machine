import { useMemo } from "react";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { defaultSharedSliceContent } from "@src/utils/editor";
import { renderSliceMock } from "@prismicio/mocks";
import { SharedSliceContent } from "@prismicio/types-internal/lib/content";
import { Slices } from "@lib/models/common/Slice";

function useEditorContentOnce({
  variationID,
  slice,
}: {
  variationID: string;
  slice: ComponentUI;
}) {
  return useMemo(() => {
    const editorContent: SharedSliceContent =
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      slice.mocks?.find((m) => m.variation === variationID) ||
      defaultSharedSliceContent(variationID);

    const apiContent = {
      ...(renderSliceMock(Slices.fromSM(slice.model), editorContent) as object),
      id: slice.model.id,
    };

    return { editorContent, apiContent };
  }, [slice.mocks, slice.model, variationID]);
}

export default useEditorContentOnce;
