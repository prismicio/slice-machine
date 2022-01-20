import { fetchApi } from "../../../../lib/builders/common/fetch";
import SliceState from "../../../../lib/models/ui/SliceState";
import { ActionType } from "./ActionType";
import { ToastPayload } from "../../../../src/ToastProvider/utils";

export default function push(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: ({ type, payload }: { type: string; payload?: any }) => void
) {
  // eslint-disable-next-line @typescript-eslint/require-await
  return async (slice: SliceState, setData: (data: ToastPayload) => void) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchApi({
      url: `/api/slices/push?sliceName=${slice.infos.sliceName}&from=${slice.from}`,
      setData,
      successMessage: "Model was correctly saved to Prismic!",
      onSuccess() {
        dispatch({ type: ActionType.Push });
      },
    });
  };
}
