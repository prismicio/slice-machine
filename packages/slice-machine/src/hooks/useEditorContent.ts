import { ComponentUI } from "@lib/models/common/ComponentUI";
import { defaultSharedSliceContent } from "@src/utils/editor";
import { renderSliceMock } from "@prismicio/mocks";
import { SharedSliceContent } from "@prismicio/types-internal/lib/documents/widgets/slices";
import { Slices } from "@slicemachine/core/build/models";

function useEditorContentOnce({
  variationID,
  slice,
}: {
  variationID: string;
  slice: ComponentUI;
}) {
  const editorContent =
    slice.mock?.[0] ||
    (defaultSharedSliceContent(variationID) as SharedSliceContent);

  const apiContent = {
    ...(renderSliceMock(Slices.fromSM(slice.model), editorContent) as object),
    id: slice.model.id,
  };

  return { editorContent, apiContent };
}

export default useEditorContentOnce;
