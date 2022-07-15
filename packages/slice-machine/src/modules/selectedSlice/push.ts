import { fetchApi } from "@lib/builders/common/fetch";
import { ExtendedComponentUI } from "./types";

export default async function pushSliceApiCall(
  extendedComponent: ExtendedComponentUI,
  setData: (data: any) => void,
  callback: (extendedComponent: ExtendedComponentUI) => void
) {
  await fetchApi({
    url: `/api/slices/push?sliceName=${extendedComponent.component.model.name}&from=${extendedComponent.component.from}`,
    setData,
    successMessage: "Model was correctly saved to Prismic!",
    onSuccess() {
      callback(extendedComponent);
    },
  });
}
