import { fetchApi } from "@lib/builders/common/fetch";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { CustomTypeMockConfig } from "@lib/models/common/MockConfig";

export default async function saveSliceApiCall(
  component: ComponentUI,
  mockConfig: CustomTypeMockConfig,
  setData: (data: any) => void,
  callback: () => void
) {
  await fetchApi({
    url: "/api/slices/save",
    params: {
      method: "POST",
      body: JSON.stringify({
        sliceName: component.model.name,
        from: component.from,
        model: component.model,
        mockConfig: mockConfig,
      }),
    },
    setData,
    successMessage: "Models & mocks have been generated successfully!",
    onSuccess() {
      callback();
    },
  });
}
