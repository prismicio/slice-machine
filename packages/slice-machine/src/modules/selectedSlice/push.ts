import { fetchApi } from "@lib/builders/common/fetch";
import SliceState from "@lib/models/ui/SliceState";

export default async function push(
  slice: SliceState,
  setData: (data: any) => void,
  callback: () => void
) {
  await fetchApi({
    url: `/api/slices/push?sliceName=${slice.model.name}&from=${slice.from}`,
    setData,
    successMessage: "Model was correctly saved to Prismic!",
    onSuccess() {
      callback();
    },
  });
}
