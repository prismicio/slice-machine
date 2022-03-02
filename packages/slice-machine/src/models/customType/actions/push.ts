import { fetchApi } from "@lib/builders/common/fetch";
import { CustomTypeState } from "@lib/models/ui/CustomTypeState";

import { ToastPayload } from "@src/modules/toaster/utils";
import {
  CustomTypeActions,
  pushCustomTypeCreator,
} from "@src/models/customType/newActions";
import { Dispatch } from "react";

export default function push(dispatch: Dispatch<CustomTypeActions>) {
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
