import { ComponentUI } from "@lib/models/common/ComponentUI";
import { defaultSharedSliceContent } from "@src/utils/editor";
import { renderSliceMock } from "@prismicio/mocks";
import { SharedSliceContent } from "@prismicio/types-internal/lib/content";
import { Slices } from "@slicemachine/core/build/models";

function useEditorContentOnce({
  variationID,
  slice,
}: {
  variationID: string;
  slice: ComponentUI;
}) {
  const editorContent: SharedSliceContent =
    slice.mock?.find((m) => m.variation === variationID) ||
    defaultSharedSliceContent(variationID);

  const apiContent = {
    ...(renderSliceMock(Slices.fromSM(slice.model), editorContent) as object),
    id: slice.model.id,
  };

  return { editorContent, apiContent };
}

export default useEditorContentOnce;
