import { fetchApi } from "@lib/builders/common/fetch";
import { CustomTypeState } from "@lib/models/ui/CustomTypeState";

import { ToastPayload } from "@src/modules/toaster/utils";
import { pushCustomTypeCreator } from "@src/models/customType/newActions";

export default function push(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: ({ type, payload }: { type: string; payload?: any }) => void
) {
  return async (ct: CustomTypeState, setData: (data: ToastPayload) => void) => {
    await fetchApi({
      url: `/api/custom-types/push?id=${ct.current.id}`,
      setData,
      successMessage: "Model was correctly saved to Prismic!",
      onSuccess() {
        dispatch(pushCustomTypeCreator());
      },
    });
  };
}
