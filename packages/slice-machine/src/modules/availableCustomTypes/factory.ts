import { CustomTypeSM, TabFields } from "@lib/models/common/CustomType";

export const createCustomType = (
  id: string,
  label: string,
  repeatable: boolean
): CustomTypeSM => {
  const defaultMainTabValue: TabFields = [];

  // All new custom type should have a default UID field non-editable
  if (repeatable) {
    defaultMainTabValue.push({
      key: "uid",
      value: {
        type: "UID",
        config: {
          label: "UID",
        },
      },
    });
  }

  return {
    id,
    label,
    format: "custom",
    repeatable,
    tabs: [
      {
        key: "Main",
        value: defaultMainTabValue,
      },
    ],
    status: true,
  };
};
