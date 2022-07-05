import { fetchApi } from "@lib/builders/common/fetch";
import SliceState from "@lib/models/ui/SliceState";

export default async function save(
  slice: SliceState,
  setData: (data: any) => void,
  callback: (SliceState: SliceState) => void
) {
  await fetchApi({
    url: "/api/slices/save",
    params: {
      method: "POST",
      body: JSON.stringify({
        sliceName: slice.model.name,
        from: slice.from,
        model: {
          ...slice.model,
          variations: slice.variations,
        },
        mockConfig: slice.mockConfig,
      }),
    },
    setData,
    successMessage: "Models & mocks have been generated successfully!",
    onSuccess() {
      const savedState: SliceState = {
        ...slice,
        initialMockConfig: slice.mockConfig,
        initialVariations: slice.variations,
      };
      callback(savedState);
    },
  });
}
