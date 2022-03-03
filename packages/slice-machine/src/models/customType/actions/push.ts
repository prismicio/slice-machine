import { fetchApi } from "@lib/builders/common/fetch";
import { CustomTypeState } from "@lib/models/ui/CustomTypeState";
import ActionType from "./";
import { ToastPayload } from "@src/modules/toaster/utils";

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
        dispatch({ type: ActionType.Push });
      },
    });
  };
}
