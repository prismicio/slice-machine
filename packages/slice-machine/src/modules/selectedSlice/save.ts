import { fetchApi } from "@lib/builders/common/fetch";
import { ExtendedComponentUI } from "./types";

export default async function saveSliceApiCall(
  extendedComponent: ExtendedComponentUI,
  setData: (data: any) => void,
  callback: (extendedComponent: ExtendedComponentUI) => void
) {
  await fetchApi({
    url: "/api/slices/save",
    params: {
      method: "POST",
      body: JSON.stringify({
        sliceName: extendedComponent.component.model.name,
        from: extendedComponent.component.from,
        model: extendedComponent.component.model,
        mockConfig: extendedComponent.mockConfig,
      }),
    },
    setData,
    successMessage: "Models & mocks have been generated successfully!",
    onSuccess() {
      callback(extendedComponent);
    },
  });
}
