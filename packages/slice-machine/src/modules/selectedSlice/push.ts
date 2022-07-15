import { fetchApi } from "@lib/builders/common/fetch";
import { ComponentUI } from "@lib/models/common/ComponentUI";

export default async function pushSliceApiCall(
  component: ComponentUI,
  setData: (data: any) => void,
  callback: () => void
) {
  await fetchApi({
    url: `/api/slices/push?sliceName=${component.model.name}&from=${component.from}`,
    setData,
    successMessage: "Model was correctly saved to Prismic!",
    onSuccess() {
      callback();
    },
  });
}
