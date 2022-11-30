import { filterSliceFromCustomType } from "@lib/utils/shared/customTypes";
import { SlicesTypes } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";

describe("Slice IO", () => {
  const baseCustomTypeModel = {
    id: "some_custom_type",
    label: "SomeCustomType",
    repeatable: false,
    status: false,
    tabs: [],
  };
  const customTypeModel: CustomTypeSM = baseCustomTypeModel;
  customTypeModel["tabs"] = [
    {
      key: "tab1",
      value: [],
    },
    {
      key: "tab2",
      value: [],
      sliceZone: {
        key: "slices",
        value: [
          {
            key: "slice_id",
            value: {
              type: SlicesTypes.SharedSlice,
            },
          },
          {
            key: "slice_2",
            value: {
              type: SlicesTypes.SharedSlice,
            },
          },
        ],
      },
    },
  ];

  it("should remove a slice from a custom type model", () => {
    const sliceIdToDelete = "slice_id";
    const result = filterSliceFromCustomType(customTypeModel, sliceIdToDelete);
    expect(result).toStrictEqual({
      id: "some_custom_type",
      label: "SomeCustomType",
      repeatable: false,
      status: false,
      tabs: [
        {
          key: "tab1",
          value: [],
        },
        {
          key: "tab2",
          value: [],
          sliceZone: {
            key: "slices",
            value: [
              {
                key: "slice_2",
                value: {
                  type: SlicesTypes.SharedSlice,
                },
              },
            ],
          },
        },
      ],
    });
  });

  it("should return an unchanged model when the slice id doesn't match", () => {
    const sliceIdToDelete = "unknown_slice";
    const result = filterSliceFromCustomType(customTypeModel, sliceIdToDelete);
    expect(result).toStrictEqual(customTypeModel);
  });

  it("should return an unchanged model when it doesn't contain a slicezone", () => {
    const sliceIdToDelete = "slice_1";
    const result = filterSliceFromCustomType(
      baseCustomTypeModel,
      sliceIdToDelete
    );
    expect(result).toStrictEqual(customTypeModel);
  });
});
