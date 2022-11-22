import { CustomTypeSM } from "@prismic-beta/slicemachine-core/build/models/CustomType";

export const createCustomType = (
  id: string,
  label: string,
  repeatable: boolean
): CustomTypeSM => ({
  id,
  label,
  repeatable,
  tabs: [
    {
      key: "Main",
      value: [],
    },
  ],
  status: true,
});
