import { fetchApi } from "@lib/builders/common/fetch";

import { CustomType } from "@lib/models/common/CustomType";
import { CustomTypeState } from "@models/ui/CustomTypeState";
import { ToastPayload } from "@src/modules/toaster/utils";
import { saveCustomTypeCreator } from "@src/models/customType/newActions";

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
        dispatch(saveCustomTypeCreator({ state: customType }));
      },
    });
  };
}
