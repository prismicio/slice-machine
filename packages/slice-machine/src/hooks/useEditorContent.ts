import { renderSliceMock } from "@prismicio/mocks";
import { SharedSliceContent } from "@prismicio/types-internal/lib/content";
import { useMemo } from "react";

import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import { Slices } from "@/legacy/lib/models/common/Slice";
import { defaultSharedSliceContent } from "@/utils/editor";

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
