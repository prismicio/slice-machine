import { fetchApi } from "@lib/builders/common/fetch";
import SliceState from "@lib/models/ui/SliceState";
import { ToastPayload } from "@src/modules/toaster/utils";
import { SliceSaveResponse } from "@lib/models/common/Slice";
import { ActionType } from "./ActionType";

export default function save(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: ({ type, payload }: { type: string; payload?: any }) => void
) {
  return async (
    slice: SliceState,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setData: (data: ToastPayload) => void = () => {}
    //    eslint-disable-next-line @typescript-eslint/require-await
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-floating-promises
    fetchApi({
      url: "/api/slices/save",
      params: {
        method: "POST",
        body: JSON.stringify({
          sliceName: slice.infos.sliceName,
          from: slice.from,
          model: {
            ...slice.model,
            variations: slice.variations,
          },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          mockConfig: slice.mockConfig,
        }),
      },
      setData,
      successMessage: "Models & mocks have been generated successfully!",
      onSuccess({ screenshots }: SliceSaveResponse) {
        const savedState = {
          ...slice,
          screenshotUrls: screenshots,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          initialMockConfig: slice.mockConfig,
          initialVariations: slice.variations,
        };
        dispatch({ type: ActionType.Save, payload: { state: savedState } });
      },
    });
  };
}
