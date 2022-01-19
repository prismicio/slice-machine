import { fetchApi } from "@lib/builders/common/fetch";

import { CustomType } from "@lib/models/common/CustomType";
import { CustomTypeState } from "@models/ui/CustomTypeState";
import ActionType from "./";
import { ToastPayload } from "@src/ToastProvider/utils";

export default function save(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: ({ type, payload }: { type: string; payload?: any }) => void
) {
  return async (
    customType: CustomTypeState,
    setData: (data: ToastPayload) => void = () => null
  ) => {
    await fetchApi({
      url: "/api/custom-types/save",
      params: {
        method: "POST",
        body: JSON.stringify({
          ...customType,
          model: CustomType.toObject(customType.current),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          mockConfig: customType.mockConfig,
        }),
      },
      setData,
      successMessage: "Model & mocks have been generated successfully!",
      onSuccess() {
        dispatch({ type: ActionType.Save, payload: { state: customType } });
      },
    });
  };
}
