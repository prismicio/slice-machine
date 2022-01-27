import { CustomType, ObjectTabs } from "@models/common/CustomType";

export const createCustomType = (
  id: string,
  label: string,
  repeatable: boolean
): CustomType<ObjectTabs> => ({
  id,
  label,
  repeatable,
  tabs: {
    Main: {
      key: "Main",
      value: {},
    },
  },
  status: true,
});
