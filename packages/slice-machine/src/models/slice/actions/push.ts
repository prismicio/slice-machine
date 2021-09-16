import { fetchApi } from "../../../../lib/builders/common/fetch";
import SliceState from "../../../../lib/models/ui/SliceState";
import { ActionType } from "./ActionType";
import { ToastPayload } from "../../../../src/ToastProvider/utils";

export default function push(
  dispatch: ({ type, payload }: { type: string; payload?: any }) => void
) {
  return async (slice: SliceState, setData: (data: ToastPayload) => void) => {
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
